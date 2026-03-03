<script setup lang="ts">
const modelValue = defineModel<boolean>({ default: false });

const handleToggle = () => {
   modelValue.value = !modelValue.value;
};
</script>

<template>
   <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      @click="handleToggle"
      class="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-lg border-2 border-transparent transition-colors duration-200 ease-in-out hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      :class="modelValue ? 'bg-primary' : 'bg-accent-500'">
      <span class="sr-only">Toggle switch</span>
      <span
         aria-hidden="true"
         class="pointer-events-none inline-block h-5 w-5 transform rounded-md bg-white shadow-sm ring-0 transition-all duration-200 ease-in-out group-active:w-6"
         :class="
            modelValue
               ? 'translate-x-5 group-active:translate-x-4'
               : 'translate-x-0'
         " />
   </button>
</template>
