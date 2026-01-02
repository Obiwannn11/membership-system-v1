<template>
  <header class="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
    
    <div class="flex items-center gap-4">
      <Sheet>
        <SheetTrigger class="md:hidden">
          <MenuIcon class="w-6 h-6 text-slate-600" />
        </SheetTrigger>
        <SheetContent side="left" class="p-0 w-64">
           <Sidebar /> 
        </SheetContent>
      </Sheet>

      <h2 class="text-lg font-semibold text-slate-800">{{ pageTitle }}</h2>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger class="focus:outline-none">
        <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition">
          <div class="text-right hidden md:block">
            <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name || 'Admin' }}</p>
            <p class="text-xs text-slate-500 capitalize">{{ authStore.user?.role || 'User' }}</p>
          </div>
          <Avatar>
            <AvatarImage src="" /> <AvatarFallback class="bg-blue-100 text-blue-600">
              {{ getInitials(authStore.user?.name) }}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer" @click="$router.push('/profile')">
          <UserIcon class="w-4 h-4 mr-2" /> Edit Profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer text-red-600 focus:text-red-600" @click="handleLogout">
          <LogOutIcon class="w-4 h-4 mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Sidebar from './Sidebar.vue'; // Import Sidebar untuk tampilan mobile
import { Menu as MenuIcon, LogOut as LogOutIcon, User as UserIcon } from 'lucide-vue-next';
import { 
    Avatar, AvatarFallback, AvatarImage 
} from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Logika Judul Halaman Otomatis berdasarkan Route Name
const pageTitle = computed(() => {
    switch (route.name) {
        case 'Dashboard': return 'Dashboard Overview';
        case 'MemberList': return 'Manajemen Data Member';
        case 'MemberCreate': return 'Tambah Member Baru';
        case 'MemberEdit': return 'Edit Data Member';
        default: return 'Membership App';
    }
});

// Helper untuk inisial nama (Misal: Budi Santoso -> BS)
const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const handleLogout = () => {
    authStore.logout();
};
</script>