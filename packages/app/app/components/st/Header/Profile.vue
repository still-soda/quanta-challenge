<script setup lang="ts">
defineProps<{
   name: string;
   desc: string;
   url?: string;
}>();
</script>

<template>
   <StSpace gap="0.625rem" align="center">
      <StSpace direction="vertical" align="end" justify="center" gap="0.25rem">
         <div class="font-bold">{{ name }}</div>
         <div class="font-light text-sm">{{ desc }}</div>
      </StSpace>
      <StAvatar :url="url" class="w-10 h-10" />
   </StSpace>
</template>
