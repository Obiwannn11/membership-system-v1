<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    // Hanya Super Admin yang boleh akses controller ini
    public function __construct()
    {
        // Pengecekan sederhana (Idealnya pakai Policy/Gate)
        // Kita cek di setiap method atau middleware nanti
    }

    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') abort(403);
        
        // Tampilkan semua user kecuali diri sendiri
        return User::where('id', '!=', $request->user()->id)->latest()->get();
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') abort(403);

        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,super_admin'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'parent_id' => $request->user()->id
        ]);

        return response()->json(['message' => 'Admin berhasil dibuat', 'data' => $user]);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') abort(403);
        
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,'.$id,
            'role' => 'required|in:admin,super_admin'
        ]);

        $data = $request->only(['name', 'email', 'role', 'is_active']);
        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'Admin berhasil diupdate']);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') abort(403);
        $user = User::findOrFail($id);
        $user->delete(); // Hati-hati, member milik admin ini harus dihandle (cascade delete di migration sudah ada)
        return response()->json(['message' => 'Admin dihapus']);
    }
}
