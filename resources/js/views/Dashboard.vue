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
        
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { memberService } from '@/services/memberService';

const totalMembers = ref(0);
const isLoading = ref(false);

const loadData = async () => {
    isLoading.value = true;
    
    // 1. Coba tarik data baru dari server (jika online)
    await memberService.pullDataFromServer();
    
    // 2. Ambil hitungan dari database lokal
    totalMembers.value = await memberService.countLocalMembers();
    
    isLoading.value = false;
};

// Saat halaman dibuka, jalankan loadData
onMounted(() => {
    loadData();
});
</script>