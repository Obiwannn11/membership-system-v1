<template>
  <div class="p-8 max-w-xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Edit Admin</h1>
    </div>

    <Card v-if="!isFetching">
      <CardContent class="pt-6">
        <form @submit.prevent="updateAdmin" class="space-y-4">
            
            <div class="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input v-model="form.name" required />
            </div>

            <div class="space-y-2">
                <Label>Alamat Email</Label>
                <Input v-model="form.email" type="email" required />
            </div>

            <div class="space-y-2">
                <Label>Ganti Password (Opsional)</Label>
                <Input v-model="form.password" type="password" placeholder="Kosongkan jika tidak diubah" />
            </div>

            <div class="space-y-2">
                <Label>Hak Akses (Role)</Label>
                <Select v-model="form.role">
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin Biasa</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" @click="$router.back()">Batal</Button>
                <Button type="submit" :disabled="isSaving">
                    {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </Button>
            </div>

        </form>
      </CardContent>
    </Card>
    <div v-else class="text-center py-10">Loading data...</div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const router = useRouter();
const route = useRoute();
const isFetching = ref(true);
const isSaving = ref(false);

const form = reactive({
    name: '',
    email: '',
    password: '',
    role: ''
});

// Ambil data user yang mau diedit
onMounted(async () => {
    try {
        const response = await api.get(`/users/${route.params.id}`);
        const user = response.data;
        form.name = user.name;
        form.email = user.email;
        form.role = user.role;
    } catch (e) {
        alert('User tidak ditemukan');
        router.push('/admins');
    } finally {
        isFetching.value = false;
    }
});

const updateAdmin = async () => {
    isSaving.value = true;
    try {
        await api.put(`/users/${route.params.id}`, form);
        alert('Data admin berhasil diperbarui!');
        router.push('/admins');
    } catch (error) {
        alert(error.response?.data?.message || 'Gagal update admin.');
    } finally {
        isSaving.value = false;
    }
};
</script>