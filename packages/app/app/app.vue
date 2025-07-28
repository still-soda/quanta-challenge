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

<style lang="css">
.page-enter-active,
.page-leave-active {
   transition: all 0.2s ease-in-out;
}

.page-enter-from,
.page-leave-to {
   opacity: 0;
   transform: translateY(1rem);
}

.page-enter-to,
.page-leave-from {
   opacity: 1;
   transform: translateY(0);
}
</style>
