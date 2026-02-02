<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Kelola Admin</h1>
      <div class="flex items-center gap-3">
        <Button @click="loadUsers" variant="outline" :disabled="isLoading">
            {{ isLoading ? 'Memuat...' : 'Refresh Data' }}
        </Button>
        <Button @click="handleCreate" class="bg-slate-900 hover:bg-slate-800">
          + Tambah Admin
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="pb-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <CardTitle class="text-lg">Total: {{ filteredUsers.length }} Admin</CardTitle>
          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              v-model="searchQuery" 
              placeholder="Cari nama atau email..." 
              class="pl-9"
            />
          </div>
        </div>
      </CardHeader>
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
                <TableRow v-for="user in paginatedUsers" :key="user.id">
                    <TableCell>{{ user.name }}</TableCell>
                    <TableCell>{{ user.email }}</TableCell>
                    <TableCell class="uppercase text-xs font-bold">{{ user.role }}</TableCell>
                    <TableCell>
                        <div class="flex gap-2">
                            <Button variant="outline" size="sm" @click="handleEdit(user.id)">
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm" @click="confirmDelete(user.id)">
                                Hapus
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                <TableRow v-if="paginatedUsers.length === 0">
                  <TableCell colspan="4" class="text-center py-12 text-gray-500">
                    {{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data admin' }}
                  </TableCell>
                </TableRow>
            </TableBody>
        </Table>

        <!-- Pagination Component -->
        <AppPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :pagination-items="paginationItems"
          :showing-text="showingText"
          :is-first-page="isFirstPage"
          :is-last-page="isLastPage"
          @prev="prevPage"
          @next="nextPage"
          @go-to="goToPage"
        />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/lib/axios';
import { usePagination } from '@/composables/usePagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppPagination } from '@/components/ui/pagination';
import { Search as SearchIcon } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const router = useRouter();
const users = ref([]);
const isLoading = ref(false);
const isDialogOpen = ref(false);
const deleteId = ref(null);
const searchQuery = ref('');

// Filtered users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
});

// Reset to page 1 when search changes
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Pagination using composable
const {
  currentPage,
  totalPages,
  paginatedItems: paginatedUsers,
  paginationItems,
  showingText,
  goToPage,
  nextPage,
  prevPage,
  isFirstPage,
  isLastPage
} = usePagination(filteredUsers, 10);

// Cek koneksi sebelum navigasi
const checkOnlineBeforeAction = (action) => {
    if (!navigator.onLine) {
        toast.warning('Koneksi Diperlukan', {
            description: 'Fitur admin membutuhkan koneksi internet yang stabil.'
        });
        return false;
    }
    return true;
};

const handleCreate = () => {
    if (checkOnlineBeforeAction()) {
        router.push('/admins/create');
    }
};

const handleEdit = (id) => {
    if (checkOnlineBeforeAction()) {
        router.push(`/admins/${id}/edit`);
    }
};

const loadUsers = async () => {
    if (!navigator.onLine) {
        toast.warning('Koneksi Diperlukan', {
            description: 'Halaman admin membutuhkan koneksi internet untuk mengambil data terbaru.'
        });
        return;
    }

    isLoading.value = true;
    try {
        const response = await api.get('/users');
        users.value = response.data;
        toast.success('Data admin berhasil dimuat.');
    } catch (e) {
        console.error(e);
        toast.error('Gagal Memuat Data', {
            description: 'Pastikan koneksi internet stabil.'
        });
    } finally {
        isLoading.value = false;
    }
};

const confirmDelete = (id) => {
    if (!checkOnlineBeforeAction()) return;
    deleteId.value = id;
    isDialogOpen.value = true;
};

const executeDelete = async () => {
    try {
        await api.delete(`/users/${deleteId.value}`);
        isDialogOpen.value = false;
        loadUsers();
        toast.success('Terhapus', {
            description: 'Data admin berhasil dihapus dari sistem.'
        });
    } catch (e) {
        toast.error('Gagal', {
            description: 'Tidak dapat menghapus data admin.'
        });
    }
};

onMounted(() => {
    loadUsers();
});
</script>