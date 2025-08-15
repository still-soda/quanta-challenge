<script setup lang="ts">
import { Down, PreviewClose, PreviewOpen, Up } from '@icon-park/vue-next';
import type { FormItemStatus } from '../Form/type';

const props = defineProps<{
   password?: boolean;
   outerClass?: string;
   status?: FormItemStatus;
}>();

const visible = ref(false);

const value = defineModel<string | number>('value');
const borderClass = computed(() => {
   return props.status === 'error'
      ? '!border !border-error'
      : props.status === 'success'
      ? '!border !border-success'
      : '';
});

const increaseValue = () => {
   value.value = isNaN(Number(value.value)) ? 0 : Number(value.value) + 1;
};
const decreaseValue = () => {
   value.value = isNaN(Number(value.value)) ? 0 : Number(value.value) - 1;
};
</script>

<template>
   <div
      class="relative text-accent-300 flex items-center gap-3 py-4 px-6 rounded-lg caret-primary selection:bg-secondary/60 transition-colors"
      :class="[outerClass, borderClass]">
      <slot name="prefix"></slot>
      <input
         v-model="value"
         :type="password ? (visible ? 'text' : 'password') : ''"
         v-bind="$attrs"
         class="bg-transparent border-none outline-none placeholder:text-accent-300 text-white flex-1" />
      <slot name="suffix"></slot>
      <div
         v-if="password"
         class="text-2xl hover:cursor-pointer"
         @click="visible = !visible">
         <PreviewClose v-if="visible" />
         <PreviewOpen v-else />
      </div>
      <div
         v-if="$attrs.type === 'number'"
         class="text-accent-300 flex flex-col items-center absolute right-2.5">
         <div
            @click.prevent="increaseValue"
            class="hover:cursor-pointer hover:bg-accent-600 px-1 rounded-sm transition-colors">
            <Up />
         </div>
         <div
            @click.prevent="decreaseValue"
            class="hover:cursor-pointer hover:bg-accent-600 px-1 rounded-sm transition-colors">
            <Down />
         </div>
      </div>
   </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
   -webkit-appearance: none;
}
</style>
