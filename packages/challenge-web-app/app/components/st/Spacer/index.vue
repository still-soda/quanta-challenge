<script setup lang="ts">
defineProps<{
   flex?: boolean;
   width?: string;
   height?: string;
   fill?: boolean;
   fillX?: boolean;
   fillY?: boolean;
   flexFull?: boolean;
   noShrink?: boolean;
}>();
</script>

<template>
   <div
      :class="{
         flex: flex,
         'w-full h-full': fill,
         'w-full': fillX,
         'h-full': fillY,
         'flex-1': flexFull,
         'shrink-0': noShrink,
      }"
      :style="{
         width: width,
         height: height,
      }"></div>
</template>
