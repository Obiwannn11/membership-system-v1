<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Daftar Anggota</h1>
      <Button @click="$router.push('/members/create')">
        + Tambah Member
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Total: {{ members.length }} Anggota</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sync Status</TableHead>
                <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="member in members" :key="member.id">
                <TableCell class="font-medium">{{ member.name }}</TableCell>
                <TableCell>{{ member.phone }}</TableCell>
                <TableCell>
                    <span :class="member.status === 'active' ? 'text-green-600' : 'text-red-600'">
                        {{ member.status }}
                    </span>
                </TableCell>
                <TableCell>
                    <span v-if="member.is_synced" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Terupload
                    </span>
                    <span v-else class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Belum Sync
                    </span>
                </TableCell>
                <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
                </TableRow>
                
                <TableRow v-if="members.length === 0">
                    <TableCell colspan="5" class="text-center py-8 text-gray-500">
                        Belum ada data anggota.
                    </TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const members = ref([]);

// Ambil data dari Dexie saat halaman dibuka
const loadMembers = async () => {
    // Kita pastikan tarik data terbaru dari server dulu (opsional, biar update)
    await memberService.pullDataFromServer();
    
    // Lalu ambil dari lokal untuk ditampilkan
    members.value = await memberService.getLocalMembers();
};

onMounted(() => {
    loadMembers();
});
</script>