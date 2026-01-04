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
                <TableHead class="w-20">Foto</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Status Member</TableHead>
                <TableHead>Berlaku s/d</TableHead>
                <TableHead class="text-center w-24">Aksi</TableHead>
                <TableHead class="w-12 text-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <CloudIcon class="w-4 h-4 mx-auto text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Status Sinkronisasi</p>
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="member in paginatedMembers" :key="member.id" class="align-middle">
                <!-- Foto - Larger Avatar -->
                <TableCell class="py-3">
                  <div class="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img 
                      v-if="member.photo" 
                      :src="getPhotoUrl(member.photo)" 
                      class="w-full h-full object-cover" 
                      :alt="member.name"
                    />
                    <span v-else class="text-xl font-semibold text-slate-400">
                      {{ member.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </TableCell>

                <!-- Nama -->
                <TableCell class="font-medium">
                  {{ member.name }}
                </TableCell>

                <!-- No HP - Masked -->
                <TableCell class="font-mono text-sm">
                  {{ maskPhone(member.phone) }}
                </TableCell>

                <!-- Status Member -->
                <TableCell>
                  <span :class="getStatusBadgeClass(getMembershipStatus(member.valid_until))">
                    {{ getStatusLabel(getMembershipStatus(member.valid_until)) }}
                  </span>
                </TableCell>

                <!-- Valid Until -->
                <TableCell class="text-sm text-gray-600">
                  {{ formatDate(member.valid_until) }}
                </TableCell>

                <!-- Aksi -->
                <TableCell>
                  <div class="flex items-center justify-center gap-1">
                    <!-- Preview -->
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-8 w-8" @click="openPreview(member)">
                          <EyeIcon class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Lihat Detail</TooltipContent>
                    </Tooltip>

                    <!-- WhatsApp -->
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a 
                          :href="`https://wa.me/${formatPhone(member.phone)}?text=Halo ${member.name}, membership Anda...`" 
                          target="_blank"
                          class="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:bg-green-50"
                        >
                          <MessageCircleIcon class="w-4 h-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Hubungi via WA</TooltipContent>
                    </Tooltip>

                    <!-- Edit -->
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-8 w-8" @click="$router.push(`/members/${member.id}/edit`)">
                          <PencilIcon class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Data</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>

                <!-- Sync Status - Icon Only -->
                <TableCell class="text-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <div v-if="member.is_synced" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                        <CheckCircleIcon class="w-4 h-4 text-green-600" />
                      </div>
                      <div v-else class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100">
                        <ClockIcon class="w-4 h-4 text-yellow-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {{ member.is_synced ? 'Tersinkronisasi' : 'Menunggu Sinkronisasi' }}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>

              <TableRow v-if="paginatedMembers.length === 0">
                <TableCell colspan="7" class="text-center py-12 text-gray-500">
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
            @click="currentPage--"
          >
            <ChevronLeftIcon class="w-4 h-4 mr-1" />
            Prev
          </Button>
          
          <div class="flex gap-1">
            <template v-for="(page, index) in paginationItems" :key="index">
              <span v-if="page === '...'" class="px-2 py-1 text-gray-400">...</span>
              <Button 
                v-else
                :variant="page === currentPage ? 'default' : 'outline'"
                size="sm"
                class="w-9"
                @click="currentPage = page"
              >
                {{ page }}
              </Button>
            </template>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
            <ChevronRightIcon class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Preview Dialog -->
    <Dialog :open="isPreviewOpen" @update:open="isPreviewOpen = $event">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Member</DialogTitle>
        </DialogHeader>
        
        <div v-if="previewMember" class="grid grid-cols-3 gap-6">
          <!-- Photo -->
          <div class="col-span-1">
            <div class="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img 
                v-if="previewMember.photo" 
                :src="getPhotoUrl(previewMember.photo)" 
                class="w-full h-full object-cover" 
                :alt="previewMember.name"
              />
              <span v-else class="text-4xl font-bold text-slate-300">
                {{ previewMember.name.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="col-span-2 space-y-4">
            <div>
              <h3 class="text-2xl font-bold">{{ previewMember.name }}</h3>
              <span :class="getStatusBadgeClass(getMembershipStatus(previewMember.valid_until))">
                {{ getStatusLabel(getMembershipStatus(previewMember.valid_until)) }}
              </span>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <PhoneIcon class="w-4 h-4 text-gray-400" />
                <span>{{ previewMember.phone || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPinIcon class="w-4 h-4 text-gray-400" />
                <span>{{ previewMember.address || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CalendarIcon class="w-4 h-4 text-gray-400" />
                <span>Berlaku s/d: {{ formatDate(previewMember.valid_until) }}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="mt-4">
          <Button variant="outline" @click="isPreviewOpen = false">Tutup</Button>
          <a 
            :href="`https://wa.me/${formatPhone(previewMember?.phone)}?text=Halo ${previewMember?.name}, membership Anda...`" 
            target="_blank"
          >
            <Button class="bg-green-600 hover:bg-green-700">
              <MessageCircleIcon class="w-4 h-4 mr-2" />
              Hubungi via WA
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Search as SearchIcon, 
  MessageCircle as MessageCircleIcon, 
  Pencil as PencilIcon,
  Eye as EyeIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Cloud as CloudIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

// ========== HELPERS ==========
const getPhotoUrl = (photo) => memberService.getPhotoUrl(photo);

const formatPhone = (phone) => {
  if (!phone) return '';
  let p = phone.replace(/[^0-9]/g, '');
  if (p.startsWith('08')) {
    p = '62' + p.substring(1);
  }
  return p;
};

const maskPhone = (phone) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length <= 4) return cleaned;
  const lastFour = cleaned.slice(-4);
  const maskedPart = '*'.repeat(cleaned.length - 4);
  return maskedPart + lastFour;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    timeZone: 'Asia/Makassar'
  });
};

// Get membership status based on valid_until date (Makassar timezone)
const getMembershipStatus = (validUntil) => {
  if (!validUntil) return 'inactive';
  
  const now = new Date();
  const validDate = new Date(validUntil);
  const oneWeekAfter = new Date(validDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Set to Makassar timezone comparison
  const nowMakassar = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
  const validMakassar = new Date(validDate.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
  const oneWeekMakassar = new Date(oneWeekAfter.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
  
  if (nowMakassar <= validMakassar) {
    return 'active'; // Belum lewat tanggal valid
  } else if (nowMakassar <= oneWeekMakassar) {
    return 'expired'; // Lewat tapi belum 1 minggu
  } else {
    return 'inactive'; // Lewat lebih dari 1 minggu
  }
};

const getStatusLabel = (status) => {
  const labels = {
    active: 'Aktif',
    expired: 'Expired',
    inactive: 'Tidak Aktif'
  };
  return labels[status] || '-';
};

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
    expired: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800',
    inactive: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'
  };
  return classes[status] || classes.inactive;
};

// ========== STATE ==========
const isLoading = ref(false);
const members = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

// Preview Dialog
const isPreviewOpen = ref(false);
const previewMember = ref(null);

const openPreview = (member) => {
  previewMember.value = member;
  isPreviewOpen.value = true;
};

// ========== COMPUTED: FILTER & PAGINATION ==========
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value;
  
  const query = searchQuery.value.toLowerCase();
  return members.value.filter(member => 
    member.name.toLowerCase().includes(query) ||
    member.phone?.includes(query)
  );
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage));

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMembers.value.slice(start, end);
});

// Smart pagination: [1] [2] [...] [n-2] [n-1] [n]
const paginationItems = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const items = [];
  
  if (total <= 7) {
    // Show all pages if 7 or less
    for (let i = 1; i <= total; i++) {
      items.push(i);
    }
  } else {
    // Always show first page
    items.push(1);
    
    if (current <= 3) {
      // Near start: [1] [2] [3] [4] [...] [n-1] [n]
      items.push(2, 3, 4);
      items.push('...');
      items.push(total - 1, total);
    } else if (current >= total - 2) {
      // Near end: [1] [...] [n-3] [n-2] [n-1] [n]
      items.push('...');
      items.push(total - 3, total - 2, total - 1, total);
    } else {
      // Middle: [1] [...] [c-1] [c] [c+1] [...] [n]
      items.push('...');
      items.push(current - 1, current, current + 1);
      items.push('...');
      items.push(total);
    }
  }
  
  return items;
});

// ========== METHODS ==========
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