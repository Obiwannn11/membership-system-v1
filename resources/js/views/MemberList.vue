<template>
  <div class="p-4 sm:p-8">
    <!-- Header - Responsive -->
    <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold">Daftar Anggota</h1>
      <div class="flex flex-wrap items-center gap-2 sm:gap-4">
        <!-- View Mode Toggle -->
        <div class="flex rounded-lg border overflow-hidden">
          <button 
            :class="[
              'px-3 py-2 flex items-center gap-1 text-sm transition-colors',
              viewMode === 'table' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'
            ]"
            @click="viewMode = 'table'"
          >
            <TableIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Table</span>
          </button>
          <button 
            :class="[
              'px-3 py-2 flex items-center gap-1 text-sm transition-colors',
              viewMode === 'card' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'
            ]"
            @click="viewMode = 'card'"
          >
            <LayoutGridIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Card</span>
          </button>
        </div>

        <Button @click="loadMembers" variant="outline" size="sm" :disabled="isLoading">
          <RefreshCwIcon class="w-4 h-4 sm:mr-1" />
          <span class="hidden sm:inline">{{ isLoading ? 'Memuat...' : 'Refresh' }}</span>
        </Button>
        <Button size="sm" @click="$router.push('/members/create')">
          <PlusIcon class="w-4 h-4 sm:mr-1" />
          <span class="hidden sm:inline">Tambah Member</span>
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="pb-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <CardTitle class="text-lg">Total: {{ filteredMembers.length }} Anggota</CardTitle>
          <!-- Search -->
          <div class="relative w-full sm:w-64">
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
        <!-- TABLE VIEW -->
        <div v-if="viewMode === 'table'" class="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-24">Foto</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead class="hidden sm:table-cell">No HP</TableHead>
                <TableHead class="text-center">Status</TableHead>
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
                <!-- Foto -->
                <TableCell class="py-3">
                  <div 
                    class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 hover:ring-2 hover:ring-primary/50"
                    @click="openPhotoViewer(member)"
                  >
                    <img 
                      v-if="member.photo" 
                      :src="getPhotoUrl(member.photo)" 
                      class="w-full h-full object-cover" 
                      :alt="member.name"
                    />
                    <span v-else class="text-lg sm:text-xl font-semibold text-slate-400">
                      {{ member.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </TableCell>

                <!-- Nama -->
                <TableCell class="font-medium">
                  <div>{{ member.name }}</div>
                  <!-- Show phone on mobile under name -->
                  <div class="text-xs text-gray-500 font-mono sm:hidden">{{ maskPhone(member.phone) }}</div>
                </TableCell>

                <!-- No HP - Hidden on mobile -->
                <TableCell class="font-mono text-sm hidden sm:table-cell">
                  <Tooltip>
                    <TooltipTrigger class="cursor-help underline decoration-dotted underline-offset-2">
                      {{ maskPhone(member.phone) }}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p class="font-mono">{{ member.phone || '-' }}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <!-- Status & Countdown -->
                <TableCell>
                  <div class="flex flex-col gap-1 items-center">
                    <span :class="getStatusBadgeClass(getMembershipStatus(member.valid_until))" class="w-fit text-[10px] sm:text-xs">
                      {{ getStatusLabel(getMembershipStatus(member.valid_until)) }}
                    </span>
                    <span :class="getCountdownClass(member.valid_until)" class="text-[10px] sm:text-xs font-medium">
                      {{ getCountdownText(member.valid_until) }}
                    </span>
                  </div>
                </TableCell>

                <!-- Aksi -->
                <TableCell>
                  <div class="flex items-center justify-center gap-0.5 sm:gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-7 w-7 sm:h-8 sm:w-8" @click="openPreview(member)">
                          <EyeIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Lihat Detail</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a 
                          :href="`https://wa.me/${formatPhone(member.phone)}?text=Halo ${member.name}, membership Anda...`" 
                          target="_blank"
                          class="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-md text-green-600 hover:bg-green-50"
                        >
                          <MessageCircleIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Hubungi via WA</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-7 w-7 sm:h-8 sm:w-8" @click="$router.push(`/members/${member.id}/edit`)">
                          <PencilIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Data</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>

                <!-- Sync Status -->
                <TableCell class="text-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <div v-if="member.is_synced" class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100">
                        <CheckCircleIcon class="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <div v-else class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-100">
                        <ClockIcon class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {{ member.is_synced ? 'Tersinkronisasi' : 'Menunggu Sinkronisasi' }}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>

              <TableRow v-if="paginatedMembers.length === 0">
                <TableCell colspan="6" class="text-center py-12 text-gray-500">
                  {{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data member' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- CARD VIEW -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <MemberCard 
            v-for="member in paginatedMembers" 
            :key="member.id"
            :member="member"
            @preview="openPreview"
            @edit="(m) => $router.push(`/members/${m.id}/edit`)"
            @view-photo="openPhotoViewer"
          />

          <!-- Empty State -->
          <div 
            v-if="paginatedMembers.length === 0" 
            class="col-span-full text-center py-12 text-gray-500"
          >
            {{ searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data member' }}
          </div>
        </div>

        <!-- Pagination - Responsive -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronLeftIcon class="w-4 h-4" />
            <span class="hidden sm:inline ml-1">Prev</span>
          </Button>
          
          <!-- Page numbers - Hidden on mobile -->
          <div class="hidden sm:flex gap-1">
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

          <!-- Page indicator - Mobile only -->
          <span class="sm:hidden text-sm text-gray-500">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <span class="hidden sm:inline mr-1">Next</span>
            <ChevronRightIcon class="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Fullscreen Photo Viewer -->
    <Dialog :open="isPhotoViewerOpen" @update:open="isPhotoViewerOpen = $event">
      <DialogContent class="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent shadow-none">
        <div 
          class="relative w-full h-full flex items-center justify-center"
          @click="isPhotoViewerOpen = false"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            class="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
            @click="isPhotoViewerOpen = false"
          >
            <XIcon class="w-6 h-6" />
          </Button>

          <div class="max-w-[90vw] max-h-[90vh] overflow-hidden rounded-lg">
            <img 
              v-if="viewerPhoto" 
              :src="getPhotoUrl(viewerPhoto)" 
              class="max-w-full max-h-[90vh] object-contain"
              :alt="viewerName"
              @click.stop
            />
            <div v-else class="w-64 h-64 bg-slate-800 rounded-lg flex items-center justify-center">
              <span class="text-8xl font-bold text-slate-500">
                {{ viewerName?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </div>
          </div>

          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-2 rounded-full">
            <span class="text-white font-medium">{{ viewerName }}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Preview Dialog -->
    <Dialog :open="isPreviewOpen" @update:open="isPreviewOpen = $event">
      <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Member</DialogTitle>
        </DialogHeader>
        
        <div v-if="previewMember" class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <!-- Photo -->
          <div class="sm:col-span-1 flex justify-center sm:block">
            <div class="w-24 h-24 sm:w-full sm:aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img 
                v-if="previewMember.photo" 
                :src="getPhotoUrl(previewMember.photo)" 
                class="w-full h-full object-cover" 
                :alt="previewMember.name"
              />
              <span v-else class="text-3xl sm:text-4xl font-bold text-slate-300">
                {{ previewMember.name.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="sm:col-span-2 space-y-4">
            <div class="text-center sm:text-left">
              <h3 class="text-xl sm:text-2xl font-bold">{{ previewMember.name }}</h3>
              <div class="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span :class="getStatusBadgeClass(getMembershipStatus(previewMember.valid_until))">
                  {{ getStatusLabel(getMembershipStatus(previewMember.valid_until)) }}
                </span>
                <span :class="getCountdownClass(previewMember.valid_until)" class="text-sm font-medium">
                  {{ getCountdownText(previewMember.valid_until) }}
                </span>
              </div>
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

        <DialogFooter class="mt-4 flex-col sm:flex-row gap-2">
          <Button variant="outline" class="w-full sm:w-auto" @click="isPreviewOpen = false">Tutup</Button>
          <a 
            :href="`https://wa.me/${formatPhone(previewMember?.phone)}?text=Halo ${previewMember?.name}, membership Anda...`" 
            target="_blank"
            class="w-full sm:w-auto"
          >
            <Button class="w-full bg-green-600 hover:bg-green-700">
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
import { useMemberStatus } from '@/composables/useMemberStatus';
import MemberCard from '@/components/member/MemberCard.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  Calendar as CalendarIcon,
  X as XIcon,
  Table2 as TableIcon,
  LayoutGrid as LayoutGridIcon,
  RefreshCw as RefreshCwIcon,
  Plus as PlusIcon
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

// ========== COMPOSABLE ==========
const {
  formatDate,
  formatPhone,
  maskPhone,
  getMembershipStatus,
  getStatusLabel,
  getStatusBadgeClass,
  getCountdownText,
  getCountdownClass
} = useMemberStatus();

// ========== HELPERS ==========
const getPhotoUrl = (photo) => memberService.getPhotoUrl(photo);

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

// Fullscreen Photo Viewer
const isPhotoViewerOpen = ref(false);
const viewerPhoto = ref(null);
const viewerName = ref('');

const openPhotoViewer = (member) => {
  viewerPhoto.value = member.photo;
  viewerName.value = member.name;
  isPhotoViewerOpen.value = true;
};

// ========== VIEW MODE STATE ==========
const STORAGE_KEY = 'memberListViewMode';
const viewMode = ref(localStorage.getItem(STORAGE_KEY) || 'table');

watch(viewMode, (newMode) => {
  localStorage.setItem(STORAGE_KEY, newMode);
});

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

const paginationItems = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const items = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      items.push(i);
    }
  } else {
    items.push(1);
    
    if (current <= 3) {
      items.push(2, 3, 4);
      items.push('...');
      items.push(total - 1, total);
    } else if (current >= total - 2) {
      items.push('...');
      items.push(total - 3, total - 2, total - 1, total);
    } else {
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