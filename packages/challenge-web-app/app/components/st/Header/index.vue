<script setup lang="ts">
defineProps<{
   mode: 'blur' | 'gradient';
}>();
</script>

<template>
   <StSpace
      justify="between"
      align="center"
      class="h-[5.75rem] pl-4 pr-8 w-full shrink-0 z-[1000]"
      :class="mode === 'gradient' ? 'gradient-bg' : 'blur-bg'">
      <slot name="left"></slot>
      <slot name="right"></slot>
   </StSpace>
</template>

<style lang="css" scoped>
.gradient-bg {
   background: linear-gradient(0deg, #11111100 0%, #111111 20%);
}

.blur-bg {
   background: #111111c4;
   backdrop-filter: blur(0.75rem);
}
</style>
