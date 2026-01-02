<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Daftar Anggota</h1>
      <Button @click="$router.push('/members/create')">
        + Tambah Member
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Total: {{ members.length }} Anggota</CardTitle>
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
                <TableRow v-for="member in members" :key="member.id">
                <TableCell class="font-medium">
                    <div class="flex items-center gap-3">
                        <img v-if="member.photo" :src="member.photo" class="w-8 h-8 rounded-full object-cover border" />
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
                
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { memberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { MessageCircle as MessageCircleIcon, Pencil as PencilIcon } from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const formatPhone = (phone) => {
    if (!phone) return '';
    let p = phone.replace(/[^0-9]/g, ''); // Hapus karakter aneh (spasi, strip)
    if (p.startsWith('08')) {
        p = '62' + p.substring(1);
    }
    return p;
};

const members = ref([]);

// Ambil data dari Dexie saat halaman dibuka
const loadMembers = async () => {
    // Kita pastikan tarik data terbaru dari server dulu (opsional, biar update)
    await memberService.pullDataFromServer();
    
    // Lalu ambil dari lokal untuk ditampilkan
    members.value = await memberService.getLocalMembers();
};

onMounted(() => {
    loadMembers();
});
</script>