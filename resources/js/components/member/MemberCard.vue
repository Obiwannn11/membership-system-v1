<template>
  <div 
    :class="[
      'bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md',
      getSyncBorderClass(member.is_synced)
    ]"
    @click="$emit('preview', member)"
  >
    <!-- Header: Photo + Name + Status -->
    <div class="flex gap-4">
      <!-- Photo -->
      <div 
        class="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center"
        @click.stop="$emit('viewPhoto', member)"
      >
        <img 
          v-if="member.photo" 
          :src="getPhotoUrl(member.photo)" 
          class="w-full h-full object-cover" 
          :alt="member.name"
        />
        <span v-else class="text-2xl font-semibold text-slate-400">
          {{ member.name.charAt(0).toUpperCase() }}
        </span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-base truncate">{{ member.name }}</h3>
        <p class="text-sm text-gray-500 font-mono">{{ maskPhone(member.phone) }}</p>
        
        <!-- Status Badge + Countdown -->
        <div class="flex flex-wrap items-center gap-2 mt-1">
          <span :class="getStatusBadgeClass(getMembershipStatus(member.valid_until))">
            {{ getStatusLabel(getMembershipStatus(member.valid_until)) }}
          </span>
          <span :class="['text-xs font-medium', getCountdownClass(member.valid_until)]">
            {{ getCountdownText(member.valid_until) }}
          </span>
        </div>
      </div>

      <!-- Sync Indicator (Mobile-friendly, no tooltip) -->
      <div class="flex-shrink-0 self-start">
        <div 
          v-if="member.is_synced" 
          class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"
          title="Tersinkronisasi"
        >
          <CheckCircleIcon class="w-4 h-4 text-green-600" />
        </div>
        <div 
          v-else 
          class="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center"
          title="Menunggu Sinkronisasi"
        >
          <ClockIcon class="w-4 h-4 text-yellow-600" />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
      <!-- WhatsApp -->
      <a 
        :href="`https://wa.me/${formatPhone(member.phone)}?text=Halo ${member.name}, membership Anda...`" 
        target="_blank"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-green-600 bg-green-50 hover:bg-green-100"
        @click.stop
      >
        <MessageCircleIcon class="w-4 h-4" />
        <span class="hidden sm:inline">WA</span>
      </a>

      <!-- Edit -->
      <button 
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-gray-600 bg-gray-50 hover:bg-gray-100"
        title="Edit data Member"
        @click.stop="$emit('edit', member)"
      >
        <PencilIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Edit</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useMemberStatus } from '@/composables/useMemberStatus';
import { memberService } from '@/services/memberService';
import { 
  CheckCircle as CheckCircleIcon, 
  Clock as ClockIcon,
  MessageCircle as MessageCircleIcon,
  Pencil as PencilIcon
} from 'lucide-vue-next';

defineProps({
  member: {
    type: Object,
    required: true
  }
});

defineEmits(['preview', 'edit', 'viewPhoto']);

// Use composable
const {
  formatPhone,
  maskPhone,
  getMembershipStatus,
  getStatusLabel,
  getStatusBadgeClass,
  getCountdownText,
  getCountdownClass,
  getSyncBorderClass
} = useMemberStatus();

// Photo URL helper
const getPhotoUrl = (photo) => memberService.getPhotoUrl(photo);
</script>