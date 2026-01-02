<template>
  <div class="p-8 max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Edit Anggota</h1>
    </div>

    <Card v-if="!isLoading">
      <CardContent class="pt-6">
        <form @submit.prevent="saveChanges" class="space-y-6">
          
          <div class="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input v-model="form.name" required />
          </div>

          <div class="space-y-2">
            <Label>Nomor WhatsApp</Label>
            <Input type="tel" v-model="form.phone" required />
          </div>

          <div class="space-y-2">
            <Label>Alamat</Label>
            <Input v-model="form.address" />
          </div>

          <div class="space-y-2">
            <Label>Foto Baru (Opsional)</Label>
            <Input type="file" @change="handleFileUpload" accept="image/*" />
            
            <div v-if="previewPhoto" class="mt-2">
                <p class="text-xs text-gray-500 mb-1">Preview:</p>
                <img :src="previewPhoto" class="w-32 h-32 object-cover rounded-md border" />
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" @click="$router.back()">Batal</Button>
            <Button type="submit" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
    
    <div v-else class="text-center py-10">Memuat data...</div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const isSaving = ref(false);
const previewPhoto = ref(null);

const form = reactive({
    name: '',
    phone: '',
    address: '',
    photo: null
});

// Ambil data saat halaman dibuka
onMounted(async () => {
    const memberId = route.params.id; // Ambil ID dari URL
    const member = await memberService.getMember(memberId);
    
    if (member) {
        form.name = member.name;
        form.phone = member.phone;
        form.address = member.address;
        form.photo = member.photo;
        previewPhoto.value = member.photo;
    } else {
        alert('Data tidak ditemukan!');
        router.push('/members');
    }
    isLoading.value = false;
});

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        const base64 = await memberService.fileToBase64(file);
        form.photo = base64;
        previewPhoto.value = base64;
    }
};

const saveChanges = async () => {
    isSaving.value = true;
    try {
        await memberService.updateMember(route.params.id, form);
        alert('Data berhasil diperbarui (Pending Sync)!');
        router.push('/members');
    } catch (error) {
        console.error(error);
        alert('Gagal update data.');
    } finally {
        isSaving.value = false;
    }
};
</script>