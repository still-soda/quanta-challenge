<script setup lang="ts">
import { Close } from '@icon-park/vue-next';

defineProps<{
   content: string;
}>();

defineEmits(['remove']);
</script>

<template>
   <StSpace
      gap="0.5rem"
      align="center"
      class="p-1 px-2 rounded-[0.375rem] text-xs bg-accent-500 text-accent-200 select-none cursor-pointer border border-transparent hover:border-primary">
      <div class="text-nowrap whitespace-nowrap font-mono">
         {{ content }}
      </div>
      <div class="cursor-pointer" @click.stop="$emit('remove')">
         <slot name="remove-icon">
            <Close />
         </slot>
      </div>
   </StSpace>
</template>
