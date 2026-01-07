import { ref, computed, watch } from 'vue';

/**
 * Composable untuk pagination
 * @param {Ref|ComputedRef} items - Array of items to paginate
 * @param {number} perPage - Items per page (default: 5)
 * @returns Pagination utilities
 */
export function usePagination(items, perPage = 5) {
  const currentPage = ref(1);
  const itemsPerPage = ref(perPage);

  // Reset ke page 1 jika items berubah (misal: setelah search/filter)
  watch(() => items.value?.length, () => {
    currentPage.value = 1;
  });

  const totalItems = computed(() => items.value?.length || 0);

  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / itemsPerPage.value);
  });

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return items.value?.slice(start, end) || [];
  });

  // Range info untuk "Showing X-Y of Z"
  const showingFrom = computed(() => {
    if (totalItems.value === 0) return 0;
    return (currentPage.value - 1) * itemsPerPage.value + 1;
  });

  const showingTo = computed(() => {
    const end = currentPage.value * itemsPerPage.value;
    return Math.min(end, totalItems.value);
  });

  const showingText = computed(() => {
    if (totalItems.value === 0) return 'Tidak ada data';
    return `Menampilkan ${showingFrom.value}-${showingTo.value} dari ${totalItems.value}`;
  });

  // Smart pagination numbers dengan ellipsis
  const paginationItems = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const result = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        result.push(i);
      }
    } else {
      result.push(1);
      
      if (current <= 3) {
        result.push(2, 3, 4);
        result.push('...');
        result.push(total);
      } else if (current >= total - 2) {
        result.push('...');
        result.push(total - 3, total - 2, total - 1, total);
      } else {
        result.push('...');
        result.push(current - 1, current, current + 1);
        result.push('...');
        result.push(total);
      }
    }
    
    return result;
  });

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const isFirstPage = computed(() => currentPage.value === 1);
  const isLastPage = computed(() => currentPage.value === totalPages.value || totalPages.value === 0);

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedItems,
    paginationItems,
    showingFrom,
    showingTo,
    showingText,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage
  };
}