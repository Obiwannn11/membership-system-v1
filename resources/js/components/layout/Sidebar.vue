<template>
  <div class="h-full border-r bg-white text-slate-900 flex flex-col">
    <div class="p-6 flex items-center gap-2 font-bold text-xl text-blue-600 border-b">
      <div class="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center">M</div>
      MembershipApp
    </div>

    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      
      <router-link to="/" custom v-slot="{ href, navigate, isActive }">
        <a :href="href" @click="navigate" 
           :class="['flex items-center gap-3 px-3 py-2 rounded-md transition-colors', 
           isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-100 text-slate-600']">
          <HomeIcon class="w-5 h-5" />
          Dashboard
        </a>
      </router-link>

      <router-link to="/members" custom v-slot="{ href, navigate, isActive }">
        <a :href="href" @click="navigate" 
           :class="['flex items-center gap-3 px-3 py-2 rounded-md transition-colors', 
           isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-100 text-slate-600']">
          <UsersIcon class="w-5 h-5" />
          Data Member
        </a>
      </router-link>

      </nav>

    <div class="p-4 border-t text-xs text-center text-slate-400">
      v1.0.0 (Offline Mode)
    </div>
  </div>
</template>

<script setup>
import { Home as HomeIcon, Users as UsersIcon } from 'lucide-vue-next';
</script>