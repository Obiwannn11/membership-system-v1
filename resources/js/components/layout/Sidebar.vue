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
          <div :class="['w-2 h-2 rounded-full', connectionStatusClass]"></div>
          <span :class="['text-xs font-medium', connectionTextClass]">
            {{ connectionStatusText }}
          </span>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Home as HomeIcon, Users as UsersIcon, ShieldCheck as ShieldCheckIcon } from 'lucide-vue-next';
import api from '@/lib/axios';

const authStore = useAuthStore();

// Connection status: 'online' | 'offline' | 'unstable' | 'checking'
const connectionStatus = ref('checking');
let pingInterval = null;

// Computed classes berdasarkan status
const connectionStatusClass = computed(() => {
  switch (connectionStatus.value) {
    case 'online': return 'bg-green-500 animate-pulse';
    case 'offline': return 'bg-red-500';
    case 'unstable': return 'bg-yellow-500 animate-pulse';
    case 'checking': return 'bg-gray-400 animate-pulse';
    default: return 'bg-gray-400';
  }
});

const connectionTextClass = computed(() => {
  switch (connectionStatus.value) {
    case 'online': return 'text-slate-500';
    case 'offline': return 'text-red-600';
    case 'unstable': return 'text-yellow-600';
    case 'checking': return 'text-gray-500';
    default: return 'text-gray-500';
  }
});

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'online': return 'System Online';
    case 'offline': return 'Offline Mode';
    case 'unstable': return 'Koneksi Lambat';
    case 'checking': return 'Mengecek...';
    default: return 'Unknown';
  }
});

// Ping ke server untuk cek koneksi sebenarnya
const checkConnection = async () => {
  // Jika browser bilang offline, langsung set offline
  if (!navigator.onLine) {
    connectionStatus.value = 'offline';
    return;
  }

  const startTime = Date.now();
  
  try {
    // Ping ke endpoint yang ringan (bisa buat /api/ping atau pakai /sanctum/csrf-cookie)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 detik timeout
    
    await api.get('/ping', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    // Klasifikasi berdasarkan response time
    if (responseTime < 2000) {
      connectionStatus.value = 'online'; // < 2 detik = OK
    } else {
      connectionStatus.value = 'unstable'; // 2-5 detik = lambat
    }
    
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      // Timeout - jaringan sangat lambat
      connectionStatus.value = 'unstable';
    } else {
      // Error lain - kemungkinan offline atau server down
      connectionStatus.value = 'offline';
    }
  }
};

// Handle browser online/offline events
const handleOnlineChange = () => {
  if (!navigator.onLine) {
    connectionStatus.value = 'offline';
  } else {
    // Browser bilang online, tapi cek dulu beneran bisa akses server
    connectionStatus.value = 'checking';
    checkConnection();
  }
};

onMounted(() => {
  // Cek koneksi saat mount
  checkConnection();
  
  // Ping setiap 30 detik
  pingInterval = setInterval(checkConnection, 30000);
  
  // Listen browser online/offline
  window.addEventListener('online', handleOnlineChange);
  window.addEventListener('offline', handleOnlineChange);
});

onUnmounted(() => {
  if (pingInterval) clearInterval(pingInterval);
  window.removeEventListener('online', handleOnlineChange);
  window.removeEventListener('offline', handleOnlineChange);
});
</script>