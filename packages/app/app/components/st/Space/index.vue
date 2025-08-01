<script setup lang="ts">
const props = defineProps<{
   direction?: 'horizontal' | 'vertical';
   align?: 'start' | 'center' | 'end';
   justify?: 'start' | 'center' | 'end' | 'between' | 'around';
   gap?: string;
   wrap?: boolean;
   fillX?: boolean;
   fillY?: boolean;
   fill?: boolean;
   center?: boolean;
   noShrink?: boolean;
   noWrap?: boolean;
}>();

const direction = computed(() => {
   return props.direction || 'horizontal';
});
const align = computed(() => {
   return props.align || 'start';
});
const justify = computed(() => {
   return props.justify || 'start';
});
const gap = computed(() => {
   return props.gap || '1.5rem';
});
const wrap = computed(() => {
   return props.wrap || false;
});
</script>

<template>
   <div
      :style="{ gap: gap || '0' }"
      class="flex"
      :class="{
         'flex-row': direction === 'horizontal',
         'flex-col': direction === 'vertical',
         'items-start': align === 'start',
         'items-center': align === 'center',
         'items-end': align === 'end',
         'justify-start': justify === 'start',
         'justify-center': justify === 'center',
         'justify-end': justify === 'end',
         'justify-between': justify === 'between',
         'justify-around': justify === 'around',
         'flex-wrap': wrap,
         'flex-nowrap': !wrap,
         'w-full': props.fillX,
         'h-full': props.fillY,
         'w-full h-full': props.fill,
         '!items-center !justify-center': props.center,
         'shrink-0': props.noShrink,
         'flex-nowrap whitespace-nowrap': props.noWrap,
      }">
      <slot></slot>
   </div>
</template>
