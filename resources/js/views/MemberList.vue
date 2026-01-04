<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Daftar Anggota</h1>
      <div class="flex items-center gap-4">
        <Button @click="loadMembers" variant="outline" :disabled="isLoading">
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </Button>
        <Button @click="$router.push('/members/create')">
          + Tambah Member
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle>Total: {{ filteredMembers.length }} Anggota</CardTitle>
          <!-- Search -->
          <div class="relative w-64">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              v-model="searchQuery" 
              placeholder="Cari nama atau no HP..." 
              class="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sync Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="member in paginatedMembers" :key="member.id">
                <TableCell class="font-medium">
                  <div class="flex items-center gap-3">
                    <img v-if="member.photo" :src="getPhotoUrl(member.photo)" class="w-8 h-8 rounded-full object-cover border" />
                    <div v-else class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                      {{ member.name.charAt(0) }}
                    </div>
                    {{ member.name }}
                  </div>
                </TableCell>
                <TableCell>{{ member.phone }}</TableCell>
                <TableCell>
                  <span :class="member.status === 'active' ? 'text-green-600' : 'text-red-600'">
                    {{ member.status }}
                  </span>
                </TableCell>
                <TableCell>
                  <span v-if="member.is_synced" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Aman
                  </span>
                  <span v-else class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <a :href="`https://wa.me/${formatPhone(member.phone)}?text=Halo ${member.name}, membership Anda...`" 
                       target="_blank"
                       class="inline-flex items-center justify-center h-8 w-8 rounded-md border border-green-200 bg-green-50 text-green-600 hover:bg-green-100">
                       <MessageCircleIcon class="w-4 h-4" />
                    </a>
                    <Button variant="outline" size="icon" class="h-8 w-8" 
                        @click="$router.push(`/members/${member.id}/edit`)">
                        <PencilIcon class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="paginatedMembers.length === 0">
                <TableCell colspan="5" class="text-center py-8 text-gray-500">
                  {{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data member' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            First
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Prev
          </Button>
          
          <div class="flex gap-1">
            <Button 
              v-for="page in visiblePages" 
              :key="page"
              :variant="page === currentPage ? 'default' : 'outline'"
              size="sm"
              @click="currentPage = page"
            >
              {{ page }}
            </Button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            Last
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle as MessageCircleIcon, Pencil as PencilIcon, Search as SearchIcon } from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'vue-sonner';

const formatPhone = (phone) => {
    if (!phone) return '';
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('08')) {
        p = '62' + p.substring(1);
    }
    return p;
};

const getPhotoUrl = (photo) => memberService.getPhotoUrl(photo);

const isLoading = ref(false);
const members = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Filtered members based on search
const filteredMembers = computed(() => {
    if (!searchQuery.value) return members.value;
    
    const query = searchQuery.value.toLowerCase();
    return members.value.filter(member => 
        member.name.toLowerCase().includes(query) ||
        member.phone.includes(query)
    );
});

// Reset to page 1 when search changes
watch(searchQuery, () => {
    currentPage.value = 1;
});

// Pagination computed
const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage));

const paginatedMembers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredMembers.value.slice(start, end);
});

const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});

const loadMembers = async () => {
    isLoading.value = true;
    try {
        if (navigator.onLine) {
            members.value = await memberService.loadMembersOfflineFirst();
            toast.success('Sinkronisasi selesai.');
        } else {
            members.value = await memberService.getLocalMembers();
            toast.warning('Mode Offline: Memuat data lokal.');
        }
    } catch (e) {
        console.error("Sync error:", e);
        toast.error("Gagal sinkronisasi.");
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadMembers();
});
</script>