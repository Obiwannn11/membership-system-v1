<template>
  
  <div v-if="authStore.loadingUser" class="flex h-screen items-center justify-center bg-slate-50">
    <div class="flex flex-col items-center gap-2">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
      <p class="text-sm text-slate-500 font-medium">Loading</p>
    </div>
  </div>
  
  <template v-else>
    <router-view></router-view>
    <Toaster position="top-center" richColors :expand="true" :visibleToasts="3" />
  </template>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Toaster } from 'vue-sonner';

const authStore = useAuthStore();

onMounted(async () => {
    // Logika Re-Hydration:
    // Jika ada token di storage TAPI data user di Pinia kosong
    if (localStorage.getItem('auth_token') && !authStore.user) {
        await authStore.fetchUser();
    }
});
</script>