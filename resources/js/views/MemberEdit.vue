<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Edit Anggota</h1>
    </div>

    <div v-if="!isLoading">
      <form @submit.prevent="saveChanges">
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
                  <span class="text-sm font-medium">Ganti Foto</span>
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
                <Label>Berlaku Sampai</Label>
                <DatePicker v-model="form.valid_until" />
                <p class="text-xs text-gray-400">Tanggal berakhir membership</p>
              </div>

              <!-- Ganti bagian button footer di dalam CardContent -->

              <!-- Actions Footer - Improved Layout -->
              <div class="space-y-4 pt-6 border-t">
                <!-- Primary Actions: Save & Cancel -->
                <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    class="w-full sm:w-auto"
                    title="Kembali ke daftar member"
                    @click="$router.back()"
                  >
                    <ArrowLeftIcon class="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                  <Button 
                    type="submit" 
                    class="w-full sm:w-auto" 
                    title="Simpan perubahan data"
                    :disabled="isSaving"
                  >
                    <SaveIcon class="w-4 h-4 mr-2" />
                    {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                  </Button>
                </div>
                
                <!-- Danger Zone: Delete (Separated) -->
                <div class="pt-4 border-t border-dashed border-red-200 bg-red-50/50 -mx-6 px-6 pb-0 -mb-6 rounded-b-lg">
                  <div class="flex items-center justify-between py-3">
                    <div class="text-sm">
                      <p class="font-medium text-red-800">Zona Berbahaya</p>
                      <p class="text-red-600 text-xs">Hapus member ini secara permanen</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      class="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700"
                      title="Hapus member ini"
                      @click="confirmDelete"
                    >
                      <Trash2Icon class="w-4 h-4 sm:mr-2" />
                      <span class="hidden sm:inline">Hapus</span>
                    </Button>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      </form>
    </div>
    
    <div v-else class="text-center py-10">Memuat data...</div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Member?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Data member <strong>{{ form.name }}</strong> akan dihapus secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="isDeleteDialogOpen = false">Batal</AlertDialogCancel>
          <AlertDialogAction @click="executeDelete" class="bg-red-600 hover:bg-red-700 text-white">
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Upload as UploadIcon, Trash2 as Trash2Icon, ArrowLeft as ArrowLeftIcon, Save as SaveIcon } from 'lucide-vue-next';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'vue-sonner';
import { DatePicker } from '@/components/ui/date-picker';
import imageCompression from 'browser-image-compression';

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const isSaving = ref(false);
const previewPhoto = ref(null);
const isDeleteDialogOpen = ref(false);

const form = reactive({
    name: '',
    phone: '',
    address: '',
    photo: null,
    valid_until: ''
});

onMounted(async () => {
    try {
        const memberId = Number(route.params.id);
        if (!memberId) throw new Error("ID Member tidak valid");

        const member = await memberService.getMember(memberId);
        
        if (member) {
            form.name = member.name;
            form.phone = member.phone;
            form.address = member.address;
            form.photo = member.photo;
            form.valid_until = member.valid_until || '';
            previewPhoto.value = memberService.getPhotoUrl(member.photo);
        } else {
            toast.error("Data tidak ditemukan");
            router.push('/members');
        }
    } catch (e) {
        toast.error("Gagal memuat data member");
    } finally {
        isLoading.value = false;
    }
});

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
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

const saveChanges = async () => {
    isSaving.value = true;
    try {
        const memberId = Number(route.params.id);
        await memberService.updateMember(memberId, form);
        console.log("Updated member:", memberId, form);
        toast.success('Data Member berhasil diperbarui!');
        router.push('/members');
    } catch (error) {
        toast.error('Gagal memperbarui data Member');
    } finally {
        isSaving.value = false;
    }
};

const confirmDelete = () => {
    isDeleteDialogOpen.value = true;
};

const executeDelete = async () => {
    try {
        const memberId = Number(route.params.id);
        await memberService.deleteMember(memberId);
        isDeleteDialogOpen.value = false;
        toast.success('Member berhasil dihapus');
        router.push('/members');
    } catch (error) {
        toast.error('Gagal menghapus member');
    }
};
</script>