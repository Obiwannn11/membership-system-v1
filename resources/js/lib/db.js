import Dexie from 'dexie';

export const db = new Dexie('MembershipDB');

// Definisi Skema Tabel Lokal
// Versi 2: Tambah sync_action untuk bedakan create vs update
db.version(2).stores({
  // ++id = auto increment (id lokal)
  // server_id = id dari MySQL (nanti dipakai untuk sync)
  // is_synced = penanda apakah data ini sudah aman di server (0 = belum, 1 = sudah)
  // sync_action = 'create' | 'update' | null (untuk track operasi yang perlu dilakukan)
  members: '++id, &server_id, user_id, name, phone, status, is_synced, sync_action' 
});

export default db;