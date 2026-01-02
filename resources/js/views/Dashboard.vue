<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Dashboard Membership</h1>
        <Button @click="loadData" variant="outline" :disabled="isLoading">
            {{ isLoading ? 'Sedang Sinkronisasi...' : 'Refresh Data' }}
        </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader><CardTitle>Total Member (Lokal)</CardTitle></CardHeader>
            <CardContent>
                <p class="text-4xl font-bold">{{ totalMembers }}</p>
                <p class="text-sm text-gray-500 mt-2">Data tersimpan di browser</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Tambahkan Data</CardTitle></CardHeader>
            <CardContent>
                <div class="mt-8">
                    <Button @click="$router.push('/members')">Lihat Semua Anggota</Button>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Pending Sync</CardTitle></CardHeader>
            <CardContent>
                <p class="text-4xl font-bold text-yellow-600">{{ pendingSync }}</p>
                <p class="text-sm text-gray-500 mt-2">Data belum terkirim</p>
            </CardContent>
        </Card>
        
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { memberService } from '@/services/memberService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';

const totalMembers = ref(0);
const pendingSync = ref(0); // Tambahan: Menghitung yang belum sync
const isLoading = ref(false);

const loadData = async () => {
    isLoading.value = true;
    try {
        // Jalankan Sync Penuh (Push + Pull)
        // Kita gunakan navigator.onLine untuk cek internet
        if (navigator.onLine) {
            await memberService.syncNow();
        } else {
            console.log("Mode Offline: Hanya memuat data lokal.");
        }

        // Refresh angka-angka tampilan
        await refreshCounts();
        
    } catch (e) {
        console.error("Sync error:", e);
        alert("Gagal sinkronisasi. Cek koneksi internet.");
    } finally {
        isLoading.value = false;
    }
};

// Fungsi helper untuk menghitung ulang angka dashboard
const refreshCounts = async () => {
    totalMembers.value = await memberService.countLocalMembers();
    // Hitung berapa yang belum sync
    pendingSync.value = await memberService.countPendingMembers();
};

onMounted(() => {
    refreshCounts(); // Tampilkan angka dulu biar cepat
    loadData();      // Lalu coba sync background
});
</script>