<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Profil Saya</h1>

    <div class="grid md:grid-cols-3 gap-6">
      <Card class="md:col-span-1">
        <CardContent class="pt-6 flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500 mb-4">
                {{ userInitials }}
            </div>
            <h2 class="text-xl font-bold">{{ authStore.user?.name }}</h2>
            <p class="text-slate-500">{{ authStore.user?.email }}</p>
            <span class="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full uppercase font-bold">
                {{ authStore.user?.role }}
            </span>
        </CardContent>
      </Card>

      <Card class="md:col-span-2">
        <CardHeader>
            <CardTitle>Edit Informasi</CardTitle>
            <CardDescription>Kosongkan password jika tidak ingin menggantinya.</CardDescription>
        </CardHeader>
        <CardContent>
            <form @submit.prevent="handleUpdate" class="space-y-4">
                <div class="grid gap-2">
                    <Label>Nama Lengkap</Label>
                    <Input v-model="form.name" required />
                </div>
                <div class="grid gap-2">
                    <Label>Email</Label>
                    <Input v-model="form.email" type="email" required />
                </div>
                
                <div class="border-t my-4 pt-4">
                    <p class="text-sm font-medium mb-4">Ganti Password</p>
                    <div class="grid gap-4">
                        <div class="grid gap-2">
                            <Label>Password Baru</Label>
                            <Input v-model="form.password" type="password" placeholder="Minimal 6 karakter" />
                        </div>
                        <div class="grid gap-2">
                            <Label>Konfirmasi Password</Label>
                            <Input v-model="form.password_confirmation" type="password" placeholder="Ulangi password baru" />
                        </div>
                    </div>
                </div>

                <div class="pt-6 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        class="w-full sm:w-auto"
                        @click="$router.back()"
                    >
                        <ArrowLeftIcon class="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                    <Button 
                        type="submit" 
                        class="w-full sm:w-auto"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'vue-sonner';
import { ArrowLeftIcon } from 'lucide-vue-next';

const authStore = useAuthStore();
const isLoading = ref(false);

const form = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
});

// Isi form saat mounted
onMounted(() => {
    if (authStore.user) {
        form.name = authStore.user.name;
        form.email = authStore.user.email;
    }
});

const userInitials = computed(() => {
    return authStore.user?.name?.substring(0, 2).toUpperCase() || 'AD';
});

const handleUpdate = async () => {
    if (form.password && form.password !== form.password_confirmation) {
        toast.error('Konfirmasi password tidak cocok!');
        return;
    }

    isLoading.value = true;
    try {
        await authStore.updateProfile(form);
        toast.success('Profil berhasil diperbarui!');
        // Reset field password
        form.password = '';
        form.password_confirmation = '';
    } catch (error) {
        toast.error('Gagal update profile. Cek koneksi atau email sudah dipakai.');
    } finally {
        isLoading.value = false;
    }
};
</script>