<template>
  <div class="p-8 max-w-xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Tambah Admin Baru</h1>
      <p class="text-slate-500">Buat akun untuk staff admin baru.</p>
    </div>

    <Card>
      <CardContent class="pt-6">
        <form @submit.prevent="saveAdmin" class="space-y-4">
            
            <div class="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input v-model="form.name" placeholder="Nama Staff..." required />
            </div>

            <div class="space-y-2">
                <Label>Alamat Email</Label>
                <Input v-model="form.email" type="email" placeholder="staff@mail.com" required />
            </div>

            <div class="space-y-2">
                <Label>Password Awal</Label>
                <Input v-model="form.password" type="password" placeholder="Minimal 6 karakter" required />
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
                <Button type="submit" :disabled="isLoading">
                    {{ isLoading ? 'Menyimpan...' : 'Buat Akun' }}
                </Button>
            </div>

        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const router = useRouter();
const isLoading = ref(false);

const form = reactive({
    name: '',
    email: '',
    password: '',
    role: 'admin' // default
});

const saveAdmin = async () => {
    isLoading.value = true;
    try {
        await api.post('/users', form);
        alert('Admin berhasil dibuat!');
        router.push('/admins');
    } catch (error) {
        alert(error.response?.data?.message || 'Gagal membuat admin.');
    } finally {
        isLoading.value = false;
    }
};
</script>