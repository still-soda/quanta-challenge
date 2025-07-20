<script setup lang="ts"></script>

<template>
   <div class="w-full h-full flex">
      <StSidebar class="w-[9.3125rem]" />
      <main class="h-screen flex flex-col flex-1">
         <slot name="header"></slot>
         <slot></slot>
      </main>
   </div>
</template>
