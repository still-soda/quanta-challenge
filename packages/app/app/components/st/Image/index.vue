<script setup lang="ts">
const props = defineProps<{
   src: string;
   alt?: string;
   object?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
   width?: string | number;
   height?: string | number;
}>();

const errorLoading = ref(false);

const style = computed(() => {
   return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height:
         typeof props.height === 'number' ? `${props.height}px` : props.height,
   };
});
</script>

<template>
   <img
      v-if="!errorLoading"
      :src="src"
      :alt="alt"
      class="h-full w-full rounded-lg"
      :class="{
         'object-cover': !object || object === 'cover',
         'object-contain': object === 'contain',
         'object-fill': object === 'fill',
         'object-none': object === 'none',
         'object-scale-down': object === 'scale-down',
      }"
      :style="style"
      @error="errorLoading = true" />
   <slot v-else name="fallback">
      <StSpace
         fill
         center
         class="rounded-lg bg-accent-500 text-accent-400"
         :style="style">
         <StIcon name="ErrorPicture" size="2rem" />
      </StSpace>
   </slot>
</template>
