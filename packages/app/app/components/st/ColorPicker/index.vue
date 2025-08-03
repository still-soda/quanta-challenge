<script setup lang="ts">
import { useColorPicker } from '~/composables/utils/use-color-picker';
import '@simonwep/pickr/dist/themes/nano.min.css';
import type { FormItemStatus } from '../Form/type';

const props = defineProps<{
   outerClass?: string;
   status?: FormItemStatus;
}>();

const value = defineModel<string>('value', { default: '#FA7C0E' });
const borderClass = computed(() => {
   return props.status === 'error'
      ? '!border !border-error'
      : props.status === 'success'
      ? '!border !border-success'
      : '';
});

const { containerKey, onPickrReady } = useColorPicker();

let show = () => void 0;
onPickrReady((pickr) => {
   pickr.setColor(value.value);
   pickr.on('change', (color: any) => {
      value.value = color.toHEXA().toString();
      pickr.applyColor();
   });
   show = () => {
      pickr.show();
   };
});
</script>

<template>
   <div
      @click="show"
      :class="[
         outerClass,
         borderClass,
         'border-accent-300 text-white flex items-center hover:cursor-pointer',
      ]">
      <input
         type="text"
         readonly
         v-model="value"
         class="w-full outline-none border-none pointer-events-none" />
      <div :ref="containerKey"></div>
   </div>
</template>

<style>
.pcr-app {
   border-radius: 8px !important;
   background: #111111;
   border: 1px solid #9d9d9d !important;
}

.pcr-result {
   background: #111111 !important;
   border: 1px solid #9d9d9d !important;
   border-radius: 6px !important;
   padding-inline: 0.625rem !important;
   color: white !important;
}

.pcr-result:focus {
   outline: none !important;
   box-shadow: none !important;
}

.pcr-palette {
   border-bottom: 1px solid #9d9d9d !important;
}

.pcr-slider {
   border: 1px solid #9d9d9d !important;
}

.pcr-type {
   display: none;
   background: #fa7c0e !important;
   padding-inline: 0.625rem !important;
   border-radius: 6px !important;
}
</style>
