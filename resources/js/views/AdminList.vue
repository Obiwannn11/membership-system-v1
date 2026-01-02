<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Kelola Admin</h1>
      <Button @click="$router.push('/admins/create')" class="bg-slate-900 hover:bg-slate-800">
            + Tambah Admin
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
                    <TableHead>Terdaftar</TableHead>
                    <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="user in users" :key="user.id">
                    <TableCell>{{ user.name }}</TableCell>
                    <TableCell>{{ user.email }}</TableCell>
                    <TableCell class="uppercase text-xs font-bold">{{ user.role }}</TableCell>
                    <TableCell>{{ new Date(user.created_at).toLocaleDateString() }}</TableCell>
                    <TableCell>
                        <div class="flex gap-2">
                            <Button variant="outline" size="sm" @click="$router.push(`/admins/${user.id}/edit`)">
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm" @click="deleteUser(user.id)">
                                Hapus
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const users = ref([]);

const loadUsers = async () => {
    try {
        const response = await api.get('/users');
        users.value = response.data;
    } catch (e) {
        console.error("Gagal load users", e);
    }
};

const deleteUser = async (id) => {
    if(!confirm('Yakin hapus admin ini? Semua member di bawahnya akan ikut terhapus!')) return;
    try {
        await api.delete(`/users/${id}`);
        loadUsers(); // Refresh
    } catch (e) {
        alert('Gagal menghapus');
    }
};

onMounted(() => {
    loadUsers();
});
</script>