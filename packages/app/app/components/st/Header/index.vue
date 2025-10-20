<script setup lang="ts"></script>

<template>
   <StSpace
      justify="between"
      align="center"
      class="h-[5.75rem] pl-4 pr-8 w-full shrink-0 gradient-bg z-[1000]">
      <slot name="left"></slot>
      <slot name="right"></slot>
   </StSpace>
</template>

<style lang="css" scoped>
.gradient-bg {
   background: linear-gradient(0deg, #11111100 0%, #111111 20%);
}
</style>
