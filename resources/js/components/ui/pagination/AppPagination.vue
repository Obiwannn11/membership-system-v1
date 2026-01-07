<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t">
    <!-- Showing text - Left side -->
    <p class="text-sm text-gray-500 order-2 sm:order-1">
      {{ showingText }}
    </p>

    <!-- Pagination controls - Right side -->
    <div class="flex items-center gap-2 order-1 sm:order-2">
      <!-- Prev Button -->
      <Button 
        variant="outline" 
        size="sm" 
        :disabled="isFirstPage"
        @click="$emit('prev')"
      >
        <ChevronLeftIcon class="w-4 h-4" />
        <span class="hidden sm:inline ml-1">Prev</span>
      </Button>
      
      <!-- Page numbers - Desktop only -->
      <div class="hidden sm:flex gap-1">
        <template v-for="(page, index) in paginationItems" :key="index">
          <span v-if="page === '...'" class="px-2 py-1 text-gray-400">...</span>
          <Button 
            v-else
            :variant="page === currentPage ? 'default' : 'outline'"
            size="sm"
            class="w-9"
            @click="$emit('goTo', page)"
          >
            {{ page }}
          </Button>
        </template>
      </div>

      <!-- Page indicator - Mobile only -->
      <span class="sm:hidden text-sm text-gray-500">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <!-- Next Button -->
      <Button 
        variant="outline" 
        size="sm" 
        :disabled="isLastPage"
        @click="$emit('next')"
      >
        <span class="hidden sm:inline mr-1">Next</span>
        <ChevronRightIcon class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-vue-next';

defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  paginationItems: {
    type: Array,
    required: true
  },
  showingText: {
    type: String,
    default: ''
  },
  isFirstPage: {
    type: Boolean,
    default: false
  },
  isLastPage: {
    type: Boolean,
    default: false
  }
});

defineEmits(['prev', 'next', 'goTo']);
</script>