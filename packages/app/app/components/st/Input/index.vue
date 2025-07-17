<script setup lang="ts">
defineProps<{
   password?: boolean;
   outerClass?: string;
}>();

const visible = ref(false);
</script>

<template>
   <div
      class="text-accent-300 flex items-center gap-3 py-4 px-6 rounded-lg caret-primary selection:bg-secondary/60"
      :class="outerClass">
      <slot name="prefix"></slot>
      <input
         v-bind="$attrs"
         :type="password ? (visible ? 'text' : 'password') : ''"
         class="bg-transparent border-none outline-none placeholder:text-accent-300 flex-1" />
      <slot name="suffix"></slot>
      <div
         v-if="password"
         class="text-2xl hover:cursor-pointer"
         @click="visible = !visible">
         <StIcon v-if="visible" name="PreviewClose" />
         <StIcon v-else name="PreviewOpen" />
      </div>
   </div>
</template>
