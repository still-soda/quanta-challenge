<script setup lang="ts">
defineProps<{
   fillX?: boolean;
   fillY?: boolean;
   fill?: boolean;
   scrollX?: boolean;
   scrollY?: boolean;
   scroll?: boolean;
}>();
</script>

<template>
   <div
      :class="[
         fillX ? 'w-full' : '',
         fillY ? 'h-full' : '',
         fill ? 'w-full h-full' : '',
         scrollX ? 'overflow-x-auto' : '',
         scrollY ? 'overflow-y-auto' : '',
         scroll ? 'overflow-auto' : '',
      ]">
      <slot></slot>
   </div>
</template>
