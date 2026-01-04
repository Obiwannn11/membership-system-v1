import api from '@/lib/axios';
import { db } from '@/lib/db';

export const memberService = {
    
    // ========== PULL: Server -> Dexie ==========
    async pullDataFromServer() {
        try {
            const response = await api.get('/members');
            const membersFromServer = response.data;
            let syncedCount = 0;
            let skippedCount = 0;

            await db.transaction('rw', db.members, async () => {
                for (const member of membersFromServer) {
                    const existing = await db.members.where('server_id').equals(member.id).first();

                    // OFFLINE-FIRST: Jangan overwrite data pending
                    if (existing && existing.is_synced === 0) {
                        skippedCount++;
                        continue;
                    }

                    const dataToSave = {
                        server_id: member.id,
                        user_id: member.user_id,
                        name: member.name,
                        phone: member.phone,
                        address: member.address,
                        photo: member.photo,
                        status: member.status,
                        valid_until: member.valid_until,
                        is_synced: 1,
                        sync_action: null
                    };

                    if (existing) {
                        dataToSave.id = existing.id;
                    }

                    await db.members.put(dataToSave);
                    syncedCount++;
                }
            });

            return { synced: syncedCount, skipped: skippedCount };
        } catch (error) {
            console.error("Pull failed:", error);
            return { synced: 0, skipped: 0, error: true };
        }
    },

    // ========== PUSH: Dexie -> Server ==========
    async pushDataToServer() {
        try {
            const unsyncedMembers = await db.members
                .where('is_synced')
                .equals(0)
                .toArray();

            if (unsyncedMembers.length === 0) return 0;

            // Prepare FormData untuk upload dengan foto
            const membersToSync = [];
            for (const member of unsyncedMembers) {
                const memberData = {
                    id: member.id,
                    server_id: member.server_id,
                    name: member.name,
                    phone: member.phone,
                    address: member.address,
                    status: member.status,
                    sync_action: member.sync_action
                };

                // Handle foto - jika ada File object, convert ke base64 untuk sync
                if (member.photo instanceof File) {
                    memberData.photo = await this.fileToBase64(member.photo);
                } else {
                    memberData.photo = member.photo;
                }

                membersToSync.push(memberData);
            }

            const response = await api.post('/members/sync', { 
                members: membersToSync 
            });

            const syncedIDs = response.data.synced_ids;

            await db.transaction('rw', db.members, async () => {
                for (const item of syncedIDs) {
                    await db.members.update(item.local_id, {
                        server_id: item.server_id,
                        is_synced: 1,
                        sync_action: null,
                        photo: item.photo_path || null // Update dengan path dari server
                    });
                }
            });

            return unsyncedMembers.length;
        } catch (error) {
            console.error("Push failed:", error);
            throw error;
        }
    },

    // ========== SYNC ORCHESTRATION ==========
    async syncNow() {
        const pushedCount = await this.pushDataToServer();
        const pullResult = await this.pullDataFromServer();
        return { pushed: pushedCount, pulled: pullResult.synced, skipped: pullResult.skipped };
    },

    async loadMembersOfflineFirst() {
        if (navigator.onLine) {
            try {
                await this.pushDataToServer();
                await this.pullDataFromServer();
            } catch (error) {
                console.warn('Sync failed, using local data:', error);
            }
        }
        return await this.getLocalMembers();
    },

    // ========== LOCAL CRUD ==========
    async getLocalMembers() {
        return await db.members.toArray();
    },

    async getMember(id) {
        return await db.members.get(Number(id));
    },

    async countLocalMembers() {
        return await db.members.count();
    },

    async countPendingMembers() {
        return await db.members.where('is_synced').equals(0).count();
    },

    async addMember(formData) {
        const id = await db.members.add({
            user_id: formData.user_id,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            photo: formData.photo, // File object atau null
            status: 'active',
            is_synced: 0,
            sync_action: 'create',
            created_at: new Date().toISOString()
        });
        return id;
    },

    async updateMember(id, newData) {
        const numericId = Number(id);
        const existingMember = await db.members.get(numericId);

        await db.members.update(numericId, {
            name: newData.name,
            phone: newData.phone,
            address: newData.address,
            photo: newData.photo,
            is_synced: 0,
            sync_action: existingMember?.server_id ? 'update' : 'create',
            updated_at: new Date().toISOString()
        });

        // Auto-sync jika online
        if (navigator.onLine && existingMember?.server_id) {
            try {
                await this.pushDataToServer();
            } catch (error) {
                console.warn('Auto-sync failed:', error);
            }
        }
    },

    async deleteMember(id) {
        const numericId = Number(id);
        const member = await db.members.get(numericId);

        if (!member) throw new Error('Member not found');

        // Jika punya server_id dan online, hapus dari server juga
        if (member.server_id && navigator.onLine) {
            try {
                await api.delete(`/members/${member.server_id}`);
            } catch (error) {
                console.error('Failed to delete from server:', error);
                throw error;
            }
        }

        // Hapus dari Dexie
        await db.members.delete(numericId);
        return true;
    },

    // ========== HELPERS ==========
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // Helper: Dapatkan URL foto yang benar (handle base64 vs path)
    getPhotoUrl(photo) {
        if (!photo) return null;
        if (photo instanceof File) return URL.createObjectURL(photo);
        if (photo.startsWith('data:')) return photo; // Base64
        if (photo.startsWith('http')) return photo; // Full URL
        return `/storage/${photo}`; // Laravel storage path
    }
};