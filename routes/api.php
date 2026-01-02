<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberController;

// Route Public (Bisa diakses tanpa login)
Route::post('/login', [AuthController::class, 'login']);

// Route Protected (Harus login/punya token dulu)
Route::middleware('auth:sanctum')->group(function () {
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Cek User yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Route Member Resource (otomatis buat index, store, show, update, destroy)
    Route::apiResource('members', MemberController::class);

    // Route Khusus Sync
    Route::post('/members/sync', [MemberController::class, 'sync']);
});