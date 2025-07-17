<script setup lang="ts">
import type { FormItemStatus } from '../Form/type';

const props = defineProps<{
   password?: boolean;
   outerClass?: string;
   status?: FormItemStatus;
}>();

const visible = ref(false);

const value = defineModel<string>('value');
const borderClass = computed(() => {
   return props.status === 'error'
      ? 'border border-error'
      : props.status === 'success'
      ? 'border border-success'
      : '';
});
</script>

<template>
   <div
      class="text-accent-300 flex items-center gap-3 py-4 px-6 rounded-lg caret-primary selection:bg-secondary/60 transition-colors"
      :class="[outerClass, borderClass]">
      <slot name="prefix"></slot>
      <input
         v-model="value"
         v-bind="$attrs"
         :type="password ? (visible ? 'text' : 'password') : ''"
         class="bg-transparent border-none outline-none placeholder:text-accent-300 text-white flex-1" />
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
