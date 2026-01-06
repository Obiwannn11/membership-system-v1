<template>
  <header class="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
    
    <div class="flex items-center gap-3">
      <!-- Mobile Menu Trigger -->
      <Sheet>
        <SheetTrigger class="md:hidden p-1.5 -ml-1.5 rounded-md hover:bg-gray-100">
          <MenuIcon class="w-5 h-5 text-slate-600" />
        </SheetTrigger>
        <SheetContent side="left" class="p-0 w-64">
           <Sidebar /> 
        </SheetContent>
      </Sheet>

      <!-- Breadcrumb (replaces static title) -->
      <AppBreadcrumb />
    </div>

    <!-- User Dropdown -->
    <DropdownMenu>
      <DropdownMenuTrigger class="focus:outline-none">
        <div class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition">
          <div class="text-right hidden md:block">
            <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name || 'Admin' }}</p>
            <p class="text-xs text-slate-500 capitalize">{{ authStore.user?.role || 'User' }}</p>
          </div>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback class="bg-blue-100 text-blue-600">
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Sidebar from './Sidebar.vue';
import AppBreadcrumb from './AppBreadcrumb.vue';
import { Menu as MenuIcon, LogOut as LogOutIcon, User as UserIcon } from 'lucide-vue-next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const router = useRouter();
const authStore = useAuthStore();

const getInitials = (name) => {
  if (!name) return 'A';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>