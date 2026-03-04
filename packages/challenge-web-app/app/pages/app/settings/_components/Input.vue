<script setup lang="ts">
import type { DefineComponent } from 'vue';

defineProps<{
   icon?: DefineComponent;
   readonly?: boolean;
}>();
</script>

<template>
   <StInput
      v-bind="$attrs"
      suffixClass="!text-lg"
      :disabled="readonly"
      :outer-class="[
         '!border !border-accent-500 w-full focus-within:!border-primary/75 !rounded-md !py-2 !px-3',
         { '!cursor-not-allowed opacity-80 !bg-accent-600/50': readonly },
      ]">
      <template v-if="icon" #prefix>
         <Component :is="icon" class="text-lg text-accent-400" />
      </template>
   </StInput>
</template>
