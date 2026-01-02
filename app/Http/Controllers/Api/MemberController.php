<?php

namespace App\Http\Controllers\Api;

use App\Models\Member;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class MemberController extends Controller
{
    // 1. GET ALL (Sesuai Role)
    public function index(Request $request)
    {
        $user = $request->user();

        // Jika Super Admin, ambil semua. Jika Admin biasa, ambil miliknya saja.
        if ($user->role === 'super_admin') {
            $members = Member::with('user')->latest()->get();
        } else {
            $members = Member::where('user_id', $user->id)->latest()->get();
        }

        return response()->json($members);
    }

    // 2. CREATE (Single Input - Saat Online)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
        ]);

        // Handle Upload Foto
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('members', 'public');
        }

        $member = Member::create([
            'user_id' => $request->user()->id, // Otomatis set milik admin yang login
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'photo' => $photoPath,
            'valid_until' => $request->valid_until,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json([
            'message' => 'Member berhasil ditambahkan',
            'data' => $member
        ], 201);
    }

    // 3. SHOW (Detail Member)
    public function show($id)
    {
        $member = Member::findOrFail($id);
        
        // Pastikan Admin biasa tidak mengintip data Admin lain
        if (request()->user()->role !== 'super_admin' && $member->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($member);
    }

    // 4. UPDATE
    public function update(Request $request, $id)
    {
        $member = Member::findOrFail($id);

        // Cek hak akses
        if ($request->user()->role !== 'super_admin' && $member->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Handle Foto Baru (hapus yang lama jika ada)
        if ($request->hasFile('photo')) {
            if ($member->photo) Storage::disk('public')->delete($member->photo);
            $member->photo = $request->file('photo')->store('members', 'public');
        }

        $member->update($request->except(['photo', 'user_id'])); // user_id tidak boleh berubah

        return response()->json(['message' => 'Update berhasil', 'data' => $member]);
    }

    // 5. DELETE
    public function destroy($id)
    {
        $member = Member::findOrFail($id);

        if (request()->user()->role !== 'super_admin' && $member->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($member->photo) Storage::disk('public')->delete($member->photo);
        $member->delete();

        return response()->json(['message' => 'Member dihapus']);
    }

    // 6. SYNC (Khusus menerima data offline)
    public function sync(Request $request)
    {
        // Menerima array data dari Frontend
        $offlineData = $request->input('members'); 
        $syncedIDs = [];

        foreach ($offlineData as $data) {
            // Logika sederhana: Buat data baru dari offline
            // Di produksi nanti, kita bisa tambah logika cek duplikat berdasarkan no HP
            
            $newMember = Member::create([
                'user_id' => $request->user()->id,
                'name' => $data['name'],
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null,
                'status' => 'active',
                // Foto mungkin perlu penanganan khusus (Base64) nanti
            ]);

            // Catat ID lokal (dari HP) dan ID server (baru dibuat) untuk dikembalikan ke frontend
            $syncedIDs[] = [
                'local_id' => $data['id'], // ID dari Dexie
                'server_id' => $newMember->id // ID dari MySQL
            ];
        }

        return response()->json([
            'message' => 'Sync berhasil',
            'synced_ids' => $syncedIDs
        ]);
    }
}
