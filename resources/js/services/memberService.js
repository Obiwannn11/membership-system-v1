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
    }
};