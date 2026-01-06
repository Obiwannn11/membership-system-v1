<template>
  <!-- Mobile: Back button + Current page title -->
  <div class="flex items-center gap-2 sm:hidden">
    <button 
      v-if="canGoBack" 
      @click="$router.push(parentPath)"
      class="p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition"
      title="Kembali"
    >
      <ChevronLeftIcon class="w-5 h-5 text-slate-600" />
    </button>
    <span class="font-semibold text-slate-800 truncate">{{ currentPage }}</span>
  </div>

  <!-- Desktop: Full breadcrumb -->
  <Breadcrumb class="hidden sm:flex">
    <BreadcrumbList>
      <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
        <!-- Separator (tidak untuk item pertama) -->
        <BreadcrumbSeparator v-if="index > 0" />

        <BreadcrumbItem>
          <!-- Link untuk parent items -->
          <BreadcrumbLink 
            v-if="!crumb.isCurrentPage" 
            :href="crumb.path"
            @click.prevent="$router.push(crumb.path)"
            class="cursor-pointer"
          >
            <HomeIcon v-if="index === 0" class="w-4 h-4" />
            <span v-else>{{ crumb.label }}</span>
          </BreadcrumbLink>

          <!-- Current page (tidak bisa diklik) -->
          <BreadcrumbPage v-else>
            {{ crumb.label }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronLeft as ChevronLeftIcon, Home as HomeIcon } from 'lucide-vue-next';

const { breadcrumbs, currentPage, canGoBack, parentPath } = useBreadcrumb();
</script>