<script setup lang="ts">
defineProps<{
   content: string;
}>();
</script>

<template>
   <StPopover placement="left">
      <template #popper="{ triggered }">
         <div
            class="px-3 py-2 rounded-lg bg-accent-600 text-white transition-all text-nowrap"
            :class="[triggered ? 'translate-x-0' : 'translate-x-2']">
            {{ content }}
         </div>
      </template>
      <slot></slot>
   </StPopover>
</template>
