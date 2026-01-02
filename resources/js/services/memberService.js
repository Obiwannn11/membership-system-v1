import api from '@/lib/axios';
import { db } from '@/lib/db';

export const memberService = {
    
    // 1. FUNGSI PULL: Ambil data dari Server -> Simpan ke Dexie
    async pullDataFromServer() {
        try {
            const response = await api.get('/members');
            const membersFromServer = response.data;

            // Gunakan Transaction agar aman dan atomik
            await db.transaction('rw', db.members, async () => {
                for (const member of membersFromServer) {
                    // 1. Cek apakah member ini sudah ada di Dexie berdasarkan server_id
                    const existing = await db.members.where('server_id').equals(member.id).first();

                    // 2. Siapkan data yang mau disimpan
                    const dataToSave = {
                        server_id: member.id,
                        user_id: member.user_id,
                        name: member.name,
                        phone: member.phone,
                        address: member.address,
                        photo: member.photo,
                        status: member.status,
                        valid_until: member.valid_until,
                        is_synced: 1 // Tandai sudah sinkron
                    };

                    // 3. Jika sudah ada, Pakai ID lokal lama (agar ter-update, bukan insert baru)
                    if (existing) {
                        dataToSave.id = existing.id; 
                    }

                    // 4. Simpan (Put akan otomatis Update jika ID ada, atau Insert jika tidak)
                    await db.members.put(dataToSave);
                }
            });
            
            console.log(`Berhasil sinkronisasi ${membersFromServer.length} data.`);
            return membersFromServer.length;

        } catch (error) {
            console.error("Gagal menarik data server:", error);
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
                    // Update record lokal: isi server_id dan set synced = 1
                    await db.members.update(item.local_id, {
                        server_id: item.server_id,
                        is_synced: 1
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
        // 1. Kirim data lokal dulu (Push)
        const pushedCount = await this.pushDataToServer();
        
        // 2. Tarik data terbaru dari server (Pull)
        const pulledCount = await this.pullDataFromServer();

        return { pushed: pushedCount, pulled: pulledCount };
    },

    async countPendingMembers() {
        return await db.members.where('is_synced').equals(0).count();
    }   
    
};