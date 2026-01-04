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
        {{ displayDate }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar 
        v-model="calendarValue"
        initial-focus
        @update:model-value="handleSelect"
      />
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { computed } from 'vue';
import { CalendarDate, getLocalTimeZone, today, parseDate } from '@internationalized/date';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const props = defineProps({
  modelValue: String // Format: 'YYYY-MM-DD'
});

const emit = defineEmits(['update:modelValue']);

// Convert string 'YYYY-MM-DD' to CalendarDate object
const calendarValue = computed({
  get() {
    if (!props.modelValue) return undefined;
    try {
      return parseDate(props.modelValue);
    } catch {
      return undefined;
    }
  },
  set(val) {
    // This is handled by handleSelect
  }
});

const handleSelect = (date) => {
  if (date) {
    // Convert CalendarDate to 'YYYY-MM-DD' string
    const formatted = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    emit('update:modelValue', formatted);
  }
};

const displayDate = computed(() => {
  if (!props.modelValue) return 'Pilih tanggal';
  try {
    const date = parseDate(props.modelValue);
    // Format ke bahasa Indonesia
    const jsDate = date.toDate(getLocalTimeZone());
    return jsDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return 'Pilih tanggal';
  }
});
</script>