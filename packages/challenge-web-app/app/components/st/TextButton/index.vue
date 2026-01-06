<script setup lang="ts">
defineEmits(['click']);

const props = defineProps<{
   text?: string;
}>();
</script>

<template>
   <div
      @click="$emit('click')"
      :class="[
         'st-font-caption text-primary underline underline-offset-3',
         'cursor-pointer hover:opacity-75 transition-opacity',
      ]">
      <slot>{{ props.text }}</slot>
   </div>
</template>
