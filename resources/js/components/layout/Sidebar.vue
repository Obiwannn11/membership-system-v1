<template>
  <div class="h-full border-r bg-white text-slate-950 flex flex-col">
    
    <div class="p-6 flex items-center gap-3 font-bold text-xl tracking-tight border-b">
      <div class="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
      </div>
      Membership
    </div>

    <nav class="flex-1 p-4 space-y-1 overflow-y-auto font-medium">
      
      <router-link to="/" custom v-slot="{ href, navigate, isExactActive }">
        <a :href="href" @click="navigate" 
           :class="['flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200', 
           isExactActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900']">
          <HomeIcon class="w-4 h-4" />
          Dashboard
        </a>
      </router-link>

      <router-link to="/members" custom v-slot="{ href, navigate, isActive }">
        <a :href="href" @click="navigate" 
           :class="['flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200', 
           isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900']">
          <UsersIcon class="w-4 h-4" />
          Data Member
        </a>
      </router-link>

      <div v-if="authStore.user?.role === 'super_admin'" class="mt-8">
          <div class="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              System Admin
          </div>

          <router-link to="/admins" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" @click="navigate" 
               :class="['flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200', 
               isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900']">
              <ShieldCheckIcon class="w-4 h-4" />
              Kelola Admin
            </a>
          </router-link>
      </div>
    
    </nav>

    <div class="p-4 border-t bg-slate-50">
       <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-xs font-medium text-slate-500">System Online</span>
       </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { Home as HomeIcon, Users as UsersIcon, ShieldCheck as ShieldCheckIcon } from 'lucide-vue-next';

const authStore = useAuthStore();
</script>