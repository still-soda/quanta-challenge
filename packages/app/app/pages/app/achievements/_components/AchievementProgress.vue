<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
   progress: number | string;
}>();

const progressValue = computed(() => Math.min(Number(props.progress), 100));
const progressWidth = computed(() => `${progressValue.value}%`);
</script>

<template>
   <div class="w-full gap-3 flex items-center mt-1">
      <div class="w-full rounded-full h-2.5 bg-accent-500 relative">
         <div
            class="h-2.5 rounded-full bg-primary absolute top-0 left-0"
            :style="{ width: progressWidth }" />
      </div>
      <div class="font-family-manrope text-sm font-bold">
         {{ progressValue }}%
      </div>
   </div>
</template>
