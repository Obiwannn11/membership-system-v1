<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Kelola Admin</h1>
      <Button @click="$router.push('/admins/create')" class="bg-slate-900 hover:bg-slate-800">
        + Tambah Admin
      </Button>
      <Button @click="loadUsers" variant="outline" :disabled="isLoading">
            {{ isLoading ? 'Sedang Sinkronisasi...' : 'Refresh Data' }}
        </Button>
    </div>

    <Card>
      <CardContent class="pt-6">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="user in users" :key="user.id">
                    <TableCell>{{ user.name }}</TableCell>
                    <TableCell>{{ user.email }}</TableCell>
                    <TableCell class="uppercase text-xs font-bold">{{ user.role }}</TableCell>
                    <TableCell>
                        <div class="flex gap-2">
                            <Button variant="outline" size="sm" @click="$router.push(`/admins/${user.id}/edit`)">
                                Edit
                            </Button>
                            
                            <Button variant="destructive" size="sm" @click="confirmDelete(user.id)">
                                Hapus
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AlertDialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Akun admin ini dan semua member yang direkrutnya akan dihapus permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="isDialogOpen = false">Batal</AlertDialogCancel>
          <AlertDialogAction @click="executeDelete" class="bg-red-600 hover:bg-red-700 text-white">
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
// Import Komponen Dialog
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'vue-sonner';

const users = ref([]);

// State untuk Dialog
const isDialogOpen = ref(false);
const deleteId = ref(null); // Menyimpan ID sementara yang mau dihapus

const loadUsers = async () => {
    try {
        const response = await api.get('/users');
        users.value = response.data;
    } catch (e) {
        console.error(e);
    }
};12

// 1. Saat tombol Hapus diklik -> Buka Dialog & Simpan ID
const confirmDelete = (id) => {
    deleteId.value = id;
    isDialogOpen.value = true;
};

// 2. Saat tombol "Ya, Hapus" di Dialog diklik -> Eksekusi ke API
const executeDelete = async () => {
    try {
        await api.delete(`/users/${deleteId.value}`);
        isDialogOpen.value = false;
        loadUsers(); 

        // Notifikasi Sukses Sonner
        toast.success('Terhapus', {
            description: 'Data admin berhasil dihapus dari sistem.'
        });

    } catch (e) {
        // Notifikasi Gagal Sonner
        toast.error('Gagal', {
            description: 'Tidak dapat menghapus data admin.'
        });
    }
};

onMounted(() => {
    loadUsers();
});
</script>