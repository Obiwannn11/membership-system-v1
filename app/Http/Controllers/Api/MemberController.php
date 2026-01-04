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
            // Cek apakah data ini UPDATE (punya server_id) atau CREATE (baru)
            if (!empty($data['server_id'])) {
                // UPDATE: Data sudah ada di server, update saja
                $member = Member::find($data['server_id']);
                
                if ($member) {
                    // Pastikan user punya akses ke member ini
                    if ($request->user()->role !== 'super_admin' && $member->user_id !== $request->user()->id) {
                        continue; // Skip jika tidak punya akses
                    }

                    $member->update([
                        'name' => $data['name'],
                        'phone' => $data['phone'],
                        'address' => $data['address'] ?? $member->address,
                        'status' => $data['status'] ?? $member->status,
                        'valid_until' => $data['valid_until'] ?? $member->valid_until,
                        // Handle foto Base64 jika ada dan berubah
                        'photo' => $this->handleBase64Photo($data['photo'] ?? null, $member->photo),
                    ]);

                    $syncedIDs[] = [
                        'local_id' => $data['id'],
                        'server_id' => $member->id,
                        'action' => 'updated'
                    ];
                }
            } else {
                // CREATE: Data baru dari offline
                $newMember = Member::create([
                    'user_id' => $request->user()->id,
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'address' => $data['address'] ?? null,
                    'status' => 'active',
                    'valid_until' => $data['valid_until'] ?? null,
                    'photo' => $this->handleBase64Photo($data['photo'] ?? null),
                ]);

                $syncedIDs[] = [
                    'local_id' => $data['id'],
                    'server_id' => $newMember->id,
                    'action' => 'created'
                ];
            }
        }

        return response()->json([
            'message' => 'Sync berhasil',
            'synced_ids' => $syncedIDs
        ]);
    }

    /**
     * Handle foto Base64 dari frontend
     * @param string|null $base64Photo - Foto dalam format Base64 dari frontend
     * @param string|null $existingPhoto - Path foto yang sudah ada (untuk update)
     * @return string|null - Path foto yang disimpan
     */
    private function handleBase64Photo($base64Photo, $existingPhoto = null)
    {
        // Jika tidak ada foto baru, kembalikan foto lama
        if (empty($base64Photo)) {
            return $existingPhoto;
        }

        // Jika foto baru sama dengan foto lama (path, bukan base64), skip
        if ($base64Photo === $existingPhoto) {
            return $existingPhoto;
        }

        // Cek apakah ini Base64 string (bukan URL/path biasa)
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64Photo, $matches)) {
            return $existingPhoto; // Bukan Base64, kembalikan foto lama
        }

        // Hapus foto lama jika ada
        if ($existingPhoto) {
            Storage::disk('public')->delete($existingPhoto);
        }

        // Decode Base64 dan simpan
        $extension = $matches[1]; // jpg, png, dll
        $base64Data = substr($base64Photo, strpos($base64Photo, ',') + 1);
        $decodedImage = base64_decode($base64Data);

        $filename = 'members/' . uniqid() . '.' . $extension;
        Storage::disk('public')->put($filename, $decodedImage);

        return $filename;
    }
}
