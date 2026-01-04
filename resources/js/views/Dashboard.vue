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
import { toast } from 'vue-sonner';

const totalMembers = ref(0);
const pendingSync = ref(0);
const isLoading = ref(false);

const loadData = async () => {
    isLoading.value = true;
    try {
        if (navigator.onLine) {
            const result = await memberService.syncNow();
            toast.success('Sinkronisasi selesai', {
                description: `${result.pushed} data dikirim, ${result.pulled} data diterima.`
            });
        } else {
            toast.warning('Mode Offline', {
                description: 'Menampilkan data lokal saja.'
            });
        }

        await refreshCounts();
        
    } catch (e) {
        console.error("Sync error:", e);
        toast.error('Gagal Sinkronisasi', {
            description: 'Cek koneksi internet Anda.'
        });
    } finally {
        isLoading.value = false;
    }
};

const refreshCounts = async () => {
    totalMembers.value = await memberService.countLocalMembers();
    pendingSync.value = await memberService.countPendingMembers();
};

onMounted(() => {
    refreshCounts();
    loadData();
});
</script>