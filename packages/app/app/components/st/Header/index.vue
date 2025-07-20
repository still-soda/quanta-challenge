<script setup lang="ts"></script>

<template>
   <StSpace
      justify="between"
      align="center"
      class="h-[5.75rem] pl-4 pr-8 w-full shrink-0">
      <slot name="left"></slot>
      <slot name="right"></slot>
   </StSpace>
</template>
