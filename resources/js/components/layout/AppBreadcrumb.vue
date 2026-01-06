<template>
  <div class="flex items-center gap-1.5 sm:hidden min-w-0">
    <router-link 
      v-if="canGoBack" 
      :to="parentPath"
      class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 shrink-0"
    >
      <ChevronLeftIcon class="w-4 h-4" />
      <span class="max-w-17.5 truncate">{{ parentLabel }}</span>
    </router-link>
    
    <!-- Separator -->
    <span v-if="canGoBack" class="text-gray-300 shrink-0">/</span>
    
    <!-- Current page -->
    <span class="font-semibold text-slate-800 truncate max-w-35">{{ currentPage }}</span>
  </div>

  <!-- Desktop: Full breadcrumb -->
  <Breadcrumb class="hidden sm:flex">
    <BreadcrumbList>
      <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
        <BreadcrumbSeparator v-if="index > 0" />

        <BreadcrumbItem>
          <BreadcrumbLink 
            v-if="!crumb.isCurrentPage" 
            as-child
          >
            <router-link 
              :to="crumb.path"
              class="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <HomeIcon v-if="index === 0" class="w-4 h-4" />
              <span v-else>{{ crumb.label }}</span>
            </router-link>
          </BreadcrumbLink>

          <BreadcrumbPage v-else>
            {{ crumb.label }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup>
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

const { breadcrumbs, currentPage, canGoBack, parentPath, parentLabel } = useBreadcrumb();
</script>