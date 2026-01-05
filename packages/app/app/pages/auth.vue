<script setup lang="ts">
definePageMeta({
   redirect: '/auth/login',
});
</script>

<template>
   <StMessageProvider>
      <NuxtPage />
   </StMessageProvider>
</template>
