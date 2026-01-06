<script setup lang="ts">
import authGuard from '~/middlewares/auth-guard';

definePageMeta({
   redirect: '/app/dashboard',
   middleware: [authGuard],
});
</script>

<template>
   <NuxtLayout name="app-layout">
      <StMessageProvider>
         <NuxtPage />
      </StMessageProvider>
   </NuxtLayout>
</template>

<style>
*::selection {
   background-color: var(--color-primary);
   color: white !important;
}
</style>
