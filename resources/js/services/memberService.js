import api from '@/lib/axios';
import { db } from '@/lib/db';

export const memberService = {
    
    // 1. FUNGSI PULL: Ambil data dari Server -> Simpan ke Dexie
    // OFFLINE-FIRST: Jangan overwrite data lokal yang belum di-sync!
    async pullDataFromServer() {
        try {
            const response = await api.get('/members');
            const membersFromServer = response.data;
            let syncedCount = 0;
            let skippedCount = 0;

            // Gunakan Transaction agar aman dan atomik
            await db.transaction('rw', db.members, async () => {
                for (const member of membersFromServer) {
                    // 1. Cek apakah member ini sudah ada di Dexie berdasarkan server_id
                    const existing = await db.members.where('server_id').equals(member.id).first();

                    // 2. OFFLINE-FIRST CHECK: Jika data lokal masih PENDING, JANGAN OVERWRITE!
                    if (existing && existing.is_synced === 0) {
                        console.log(`SKIP: Data "${existing.name}" masih pending sync, tidak di-overwrite.`);
                        skippedCount++;
                        continue; // Skip, jangan update data ini
                    }

                    // 3. Siapkan data yang mau disimpan
                    const dataToSave = {
                        server_id: member.id,
                        user_id: member.user_id,
                        name: member.name,
                        phone: member.phone,
                        address: member.address,
                        photo: member.photo,
                        status: member.status,
                        valid_until: member.valid_until,
                        is_synced: 1, // Tandai sudah sinkron
                        sync_action: null // Clear action
                    };

                    // 4. Jika sudah ada, Pakai ID lokal lama (agar ter-update, bukan insert baru)
                    if (existing) {
                        dataToSave.id = existing.id; 
                    }

                    // 5. Simpan (Put akan otomatis Update jika ID ada, atau Insert jika tidak)
                    await db.members.put(dataToSave);
                    syncedCount++;
                }
            });
            
            console.log(`Pull selesai: ${syncedCount} updated, ${skippedCount} skipped (pending).`);
            return { synced: syncedCount, skipped: skippedCount };

        } catch (error) {
            console.error("Gagal menarik data server:", error);
            // Jangan throw, biarkan app tetap jalan offline
            return { synced: 0, skipped: 0, error: true };
        }
    },

    // 2. FUNGSI READ: Ambil data dari Dexie (untuk ditampilkan di UI)
    async getLocalMembers() {
        return await db.members.toArray();
    },

    // 3. FUNGSI COUNT: Hitung total member lokal
    async countLocalMembers() {
        return await db.members.count();
    },

    // 4. FUNGSI CREATE (Offline First)
    async addMember(formData) {
        // Kita simpan ke Dexie dengan status belum sync
        const id = await db.members.add({
            user_id: formData.user_id, // Nanti diambil dari User yang login
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            photo: formData.photo, // Base64 string
            status: 'active',
            is_synced: 0, // PENTING: Tandai sebagai data pending
            sync_action: 'create', // Tandai ini adalah data baru
            created_at: new Date().toISOString()
        });
        
        return id;
    },
    
    // Helper: Konversi File Gambar ke Base64 agar bisa disimpan di Dexie
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },
    // ... function addMember, pullData, dll ...

    // 5. FUNGSI PUSH: Kirim data offline ke Server
    async pushDataToServer() {
        try {
            // A. Cari data yang belum sync
            const unsyncedMembers = await db.members
                .where('is_synced')
                .equals(0)
                .toArray();

            if (unsyncedMembers.length === 0) {
                console.log("Tidak ada data offline yang perlu dikirim.");
                return 0; // Tidak ada yang perlu disync
            }

            console.log(`Mengirim ${unsyncedMembers.length} data ke server...`);

            // B. Kirim ke API Laravel
            // Kita kirim array 'members' sesuai yang diminta controller
            const response = await api.post('/members/sync', { 
                members: unsyncedMembers 
            });

            const syncedIDs = response.data.synced_ids; // Balikan dari server: [{local_id: 1, server_id: 105}, ...]

            // C. Update status data di Dexie berdasarkan balasan server
            await db.transaction('rw', db.members, async () => {
                for (const item of syncedIDs) {
                    // Update record lokal: isi server_id, set synced = 1, clear sync_action
                    await db.members.update(item.local_id, {
                        server_id: item.server_id,
                        is_synced: 1,
                        sync_action: null // Clear action setelah sync berhasil
                    });
                }
            });

            console.log("Push Sync selesai!");
            return unsyncedMembers.length;

        } catch (error) {
            console.error("Gagal mengirim data offline:", error);
            throw error; // Lempar error agar UI tahu kalau gagal
        }
    },

    // 6. FUNGSI ORKESTRASI (Gabungan Pull & Push)
    // Ini fungsi utama yang dipanggil tombol "Sync"
    async syncNow() {
        // 1. Kirim data lokal dulu (Push) - OFFLINE FIRST!
        const pushedCount = await this.pushDataToServer();
        
        // 2. Tarik data terbaru dari server (Pull)
        const pullResult = await this.pullDataFromServer();

        return { pushed: pushedCount, pulled: pullResult.synced, skipped: pullResult.skipped };
    },

    // 6b. FUNGSI LOAD DATA UNTUK UI (Offline-First)
    // Gunakan ini di MemberList.vue, bukan langsung pullDataFromServer()
    async loadMembersOfflineFirst() {
        // Jika online, coba sync dulu
        if (navigator.onLine) {
            try {
                // PUSH DULU data pending ke server
                await this.pushDataToServer();
                // Baru PULL data dari server (dengan proteksi skip pending)
                await this.pullDataFromServer();
            } catch (error) {
                console.warn('Sync gagal, tampilkan data lokal:', error);
            }
        }
        
        // Selalu kembalikan data dari lokal (single source of truth)
        return await this.getLocalMembers();
    },

    async countPendingMembers() {
        return await db.members.where('is_synced').equals(0).count();
    },   


    // 7. AMBIL 1 DATA (Untuk form edit)
    async getMember(id) {
        // id yang dipakai adalah ID LOKAL (dari Dexie)
        return await db.members.get(Number(id));
    },

    // 8. UPDATE DATA (Offline First with Auto-Sync)
    async updateMember(id, newData) {
        const numericId = Number(id);
        
        // Ambil data existing untuk cek apakah punya server_id
        const existingMember = await db.members.get(numericId);
        
        // Update data di Dexie
        await db.members.update(numericId, {
            name: newData.name,
            phone: newData.phone,
            address: newData.address,
            photo: newData.photo, // update foto jika ada
            is_synced: 0, // PENTING: Reset jadi 0 agar disinkron ulang ke server
            sync_action: existingMember?.server_id ? 'update' : 'create', // Tandai action
            updated_at: new Date().toISOString()
        });

        // Auto-sync jika online dan data punya server_id
        if (navigator.onLine && existingMember?.server_id) {
            try {
                await this.pushDataToServer();
                console.log('Auto-sync update berhasil');
            } catch (error) {
                console.warn('Auto-sync gagal, data akan disync nanti:', error);
                // Tidak throw error, biarkan data tetap pending
            }
        }
    },
    
};