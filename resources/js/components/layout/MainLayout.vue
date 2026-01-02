<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    
    <aside class="hidden md:block w-64 flex-shrink-0">
      <Sidebar />
    </aside>

    <div class="flex flex-col flex-1 min-w-0">
      
      <Header />

      <main class="flex-1 overflow-y-auto">
        <router-view></router-view>
      </main>
      
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
</script>