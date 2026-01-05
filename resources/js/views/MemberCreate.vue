<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Tambah Anggota Baru</h1>
      <p class="text-gray-500">Data akan disimpan lokal terlebih dahulu.</p>
    </div>

    <form @submit.prevent="saveMember">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- LEFT: Photo Upload -->
        <Card class="md:col-span-1">
          <CardHeader>
            <CardTitle class="text-lg">Foto Member</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col items-center gap-4">
            <div class="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              <img v-if="previewPhoto" :src="previewPhoto" class="w-full h-full object-cover" />
              <div v-else class="text-center text-gray-400">
                <ImageIcon class="w-12 h-12 mx-auto mb-2" />
                <p class="text-xs">Belum ada foto</p>
              </div>
            </div>
            
            <Label for="photo" class="cursor-pointer">
              <div class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md transition">
                <UploadIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Pilih Foto</span>
              </div>
              <Input id="photo" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
            </Label>
            <p class="text-xs text-gray-400 text-center">Format: JPG, PNG. Maks 2MB</p>
          </CardContent>
        </Card>

        <!-- RIGHT: Form Fields -->
        <Card class="md:col-span-2">
          <CardHeader>
            <CardTitle class="text-lg">Informasi Member</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            
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
              <Label>Berlaku Sampai</Label>
              <DatePicker v-model="form.valid_until" />
              <p class="text-xs text-gray-400">Tanggal berakhir membership</p>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" @click="$router.back()">Batal</Button>
              <Button type="submit" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : 'Simpan Data' }}
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Upload as UploadIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { DatePicker } from '@/components/ui/date-picker';
import imageCompression from 'browser-image-compression';

const router = useRouter();
const authStore = useAuthStore();
const isSaving = ref(false);
const previewPhoto = ref(null);

// Default valid_until: 1 bulan dari sekarang
const getDefaultValidUntil = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

const form = reactive({
    name: '',
    phone: '',
    address: '',
    photo: null,
    valid_until: getDefaultValidUntil()
});

const handleFileUpload = async (event) => {
    if (!file) return;
    
    try {
        // Compress image dulu
        const compressedFile = await imageCompression(file, {
            maxSizeMB: 1, // Max 1MB
            maxWidthOrHeight: 1000, // Max dimension
            useWebWorker: true
        });
        
        // Baru convert ke Base64
        const base64 = await memberService.fileToBase64(compressedFile);
        form.photo = base64;
        previewPhoto.value = base64;
        
    } catch (error) {
        toast.error('Gagal memproses foto');
    }
};

const saveMember = async () => {
    isSaving.value = true;
    try {
        const dataToSave = {
            ...form,
            user_id: authStore.user?.id || 1
        };

        await memberService.addMember(dataToSave);
        toast.success('Data anggota berhasil dibuat.');
        router.push('/members');
        
    } catch (error) {
        toast.error('Gagal menyimpan data.');
    } finally {
        isSaving.value = false;
    }
};
</script>