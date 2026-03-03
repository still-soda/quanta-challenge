<script setup lang="ts">
import type { DefineComponent } from 'vue';

defineProps<{
   icon?: DefineComponent;
}>();
</script>

<template>
   <StInput
      v-bind="$attrs"
      suffixClass="!text-lg"
      outer-class="!bg-accent-700/50 !border !border-accent-500 w-full focus-within:!border-primary/75 !rounded-md !py-2 !px-3">
      <template v-if="icon" #prefix>
         <Component :is="icon" class="text-lg text-accent-400" />
      </template>
   </StInput>
</template>
