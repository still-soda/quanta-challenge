<script setup lang="ts">
const props = defineProps<{
   bottom?: string;
   right?: string;
   left?: string;
   top?: string;
   zIndex?: number;
}>();
</script>

<template>
   <div
      class="fixed"
      :style="{
         bottom: props.bottom || '1.82rem',
         right: props.right || '1.82rem',
         left: props.left || 'auto',
         top: props.top || 'auto',
         'z-index': props.zIndex || 1000,
      }">
      <slot></slot>
   </div>
</template>
