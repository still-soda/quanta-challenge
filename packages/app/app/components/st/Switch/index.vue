<script setup lang="ts">
const modelValue = defineModel<boolean>({ default: false });

const handleToggle = () => {
   modelValue.value = !modelValue.value;
};
</script>

<template>
   <div
      @click="handleToggle"
      class="relative inline-flex h-6 w-11 items-center rounded-full transition-all cursor-pointer hover:opacity-90 shrink-0"
      :class="modelValue ? 'bg-primary' : 'bg-accent-500'">
      <span
         class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm active:w-5"
         :class="modelValue ? 'translate-x-6' : 'translate-x-1'" />
   </div>
</template>
