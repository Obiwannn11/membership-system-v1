<template>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        :class="cn(
          'w-full justify-start text-left font-normal',
          !modelValue && 'text-muted-foreground'
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ modelValue ? formatDate(modelValue) : 'Pilih tanggal' }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar 
        v-model="internalValue" 
        @update:model-value="handleSelect"
      />
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const props = defineProps({
  modelValue: String // Format: 'YYYY-MM-DD'
});

const emit = defineEmits(['update:modelValue']);

const internalValue = ref(props.modelValue ? new Date(props.modelValue) : undefined);

watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal ? new Date(newVal) : undefined;
});

const handleSelect = (date) => {
  if (date) {
    // Convert to YYYY-MM-DD format
    const formatted = date.toISOString().split('T')[0];
    emit('update:modelValue', formatted);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
</script>