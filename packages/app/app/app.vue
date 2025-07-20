<script setup lang="ts">
import useAuthStore from './stores/auth-store';

const { initTokens } = useAuthStore();
onMounted(initTokens);
</script>

<template>
   <div
      class="w-screen h-screen bg-background text-white font-family-sans text-base min-w-[1280px] overflow-hidden">
      <NuxtPage />
   </div>
</template>
