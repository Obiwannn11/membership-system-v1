import Dexie from 'dexie';

export const db = new Dexie('MembershipDB');

// Definisi Skema Tabel Lokal
db.version(1).stores({
  // ++id = auto increment (id lokal)
  // server_id = id dari MySQL (nanti dipakai untuk sync)
  // is_synced = penanda apakah data ini sudah aman di server (0 = belum, 1 = sudah)
  members: '++id, &server_id, user_id, name, phone, status, is_synced' 
});

export default db;