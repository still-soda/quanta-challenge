<script setup lang="ts">
import { Close } from '@icon-park/vue-next';

defineProps<{
   content: string;
}>();

defineEmits(['remove']);
</script>

<template>
   <StSpace
      gap="0.4rem"
      align="center"
      class="px-2 py-[0.25rem] rounded-[0.375rem] text-xs bg-accent-500 text-accent-200 select-none cursor-pointer border border-transparent hover:border-primary">
      <div class="font-family-fira-code text-nowrap whitespace-nowrap">
         {{ content }}
      </div>
      <div
         class="cursor-pointer hover:text-red-700"
         @click.stop="$emit('remove')">
         <slot name="remove-icon">
            <Close />
         </slot>
      </div>
   </StSpace>
</template>
