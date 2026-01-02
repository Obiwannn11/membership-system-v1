<template>
  <div class="p-8 max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Tambah Anggota Baru</h1>
      <p class="text-gray-500">Data akan disimpan lokal terlebih dahulu.</p>
    </div>

    <Card>
      <CardContent class="pt-6">
        <form @submit.prevent="saveMember" class="space-y-6">
          
          <div class="space-y-2">
            <Label for="name">Nama Lengkap</Label>
            <Input id="name" v-model="form.name" required placeholder="Contoh: Budi Santoso" />
          </div>

          <div class="space-y-2">
            <Label for="phone">Nomor WhatsApp</Label>
            <Input id="phone" type="tel" v-model="form.phone" required placeholder="08..." />
          </div>

          <div class="space-y-2">
            <Label for="address">Alamat Domisili</Label>
            <Input id="address" v-model="form.address" placeholder="Jalan..." />
          </div>

          <div class="space-y-2">
            <Label for="photo">Foto (Opsional)</Label>
            <Input id="photo" type="file" @change="handleFileUpload" accept="image/*" />
            
            <div v-if="previewPhoto" class="mt-2">
                <img :src="previewPhoto" class="w-32 h-32 object-cover rounded-md border" />
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" @click="$router.back()">Batal</Button>
            <Button type="submit" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : 'Simpan Data' }}
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
import { useAuthStore } from '@/stores/auth'; // Butuh ID user yg login
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'vue-sonner';

const router = useRouter();
const authStore = useAuthStore();
const isSaving = ref(false);
const previewPhoto = ref(null);

const form = reactive({
    name: '',
    phone: '',
    address: '',
    photo: null // Akan berisi Base64
});

// Handle File Input -> Convert to Base64 -> Preview
const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        // Kompresi atau validasi ukuran bisa dilakukan di sini nanti
        const base64 = await memberService.fileToBase64(file);
        form.photo = base64;
        previewPhoto.value = base64;
    }
};

const saveMember = async () => {
    isSaving.value = true;
    try {
        // Siapkan data
        const dataToSave = {
            ...form,
            user_id: authStore.user?.id || 1 // Fallback ID jika null
        };

        // Simpan ke Dexie
        await memberService.addMember(dataToSave);

        toast.success('Data anggota Berhasil Dibuat.');

        router.push('/members'); // Kembali ke list
        
    } catch (error) {
        // console.error(error);
        toast.error('Gagal menyimpan data.');
    } finally {
        isSaving.value = false;
    }
};
</script>