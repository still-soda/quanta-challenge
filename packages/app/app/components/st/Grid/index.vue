<script setup lang="ts">
const props = defineProps<{
   fill?: boolean;
   fillX?: boolean;
   fillY?: boolean;
   cols?: number;
   rows?: number;
   gap?: string;
}>();

const gridTemplateColumns = computed(() => {
   return props.cols ? `repeat(${props.cols ?? 1}, minmax(0, 1fr))` : undefined;
});
const gridTemplateRows = computed(() => {
   return props.rows ? `repeat(${props.rows ?? 1}, minmax(0, 1fr))` : undefined;
});
</script>

<template>
   <div
      class="grid"
      :class="{
         'w-full h-full': fill,
         'w-full': fillX,
         'h-full': fillY,
      }"
      :style="{
         gridTemplateColumns: gridTemplateColumns,
         gridTemplateRows: gridTemplateRows,
         gap: gap ?? '1rem',
      }">
      <slot></slot>
   </div>
</template>
