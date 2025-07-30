<script setup lang="ts">
import { usePopper } from '~/composables/utils/use-popper';
import type { FormItemStatus } from '../Form/type';
import { Teleport } from 'vue';
import {
   TOGGLE_OPTION_INJECT_KEY,
   type SelectOption,
   type ToggleOption,
} from './type';

const props = defineProps<{
   outerClass?: string;
   optionsContainerClass?: string;
   maxContainerHeight?: number;
   status?: FormItemStatus;
   placeholder?: string;
   attachToBody?: boolean;
   options?: SelectOption[];
   multiple?: boolean;
}>();

const selected = defineModel<string | string[]>('value', {
   type: [String, Array],
   default: '',
});
const borderClass = computed(() => {
   return props.status === 'error'
      ? '!border !border-error'
      : props.status === 'success'
      ? '!border !border-success'
      : '';
});

const opened = ref(false);
const toggleSelect = () => {
   opened.value = !opened.value;
};

const {
   containerKey,
   popperKey,
   onPopperUpdate,
   onFirstUpdate,
   popperInstance,
} = usePopper();
const upside = ref(false);
onPopperUpdate('write', ({ state }) => {
   upside.value = state.placement?.startsWith('top') ?? false;
});
onFirstUpdate((state) => {
   upside.value = state.placement?.startsWith('top') ?? false;
});
onMounted(() => {
   setTimeout(() => {
      popperInstance.value?.update();
   }, 500);
});

const selectedSet = computed(() => {
   const currentSelected = (() => {
      if (props.multiple) {
         return Array.isArray(selected.value)
            ? selected.value
            : selected.value
            ? [selected.value]
            : [];
      }
      return selected.value ? [selected.value] : [];
   })();
   return new Set(currentSelected as string[]);
});
const toggleOption: ToggleOption = (value) => {
   if (!props.multiple) {
      selected.value = selected.value === value ? '' : value;
      opened.value = false;
      return;
   }
   const selectedArray = selected.value as string[];
   selectedSet.value.has(value)
      ? (selected.value = selectedArray.filter((v) => v !== value))
      : (selected.value = [...selectedArray, value]);
};
provide(TOGGLE_OPTION_INJECT_KEY, toggleOption);
</script>

<template>
   <div
      :ref="containerKey"
      @click="toggleSelect"
      class="relative text-accent-300 flex items-center gap-3 py-4 px-6 rounded-lg caret-primary selection:bg-secondary/60 transition-colors hover:cursor-pointer"
      :class="[outerClass, borderClass]">
      <slot name="prefix"></slot>
      <div class="flex-1">
         <span
            v-if="!selected || selected?.length === 0"
            alt="placeholder"
            class="text-accent-300">
            {{ placeholder ?? '请选择选项' }}
         </span>
         <slot v-else name="selected-preview" :value="selected">
            <span class="text-white">
               {{ Array.isArray(selected) ? selected.join(', ') : selected }}
            </span>
         </slot>
      </div>
      <slot name="suffix"></slot>
      <StIcon
         name="Down"
         class="text-xl transition-all"
         :class="{ 'rotate-180': opened }" />

      <Component
         :is="props.attachToBody ? Teleport : 'div'"
         to="body"
         class="absolute z-50">
         <div
            class="p-2 rounded-lg bg-background border border-accent-300 absolute hover:cursor-auto z-50"
            :style="{
               transition: 'margin 0.1s ease-in-out, opacity 0.1s ease-in-out',
               maxHeight: props.maxContainerHeight
                  ? `${props.maxContainerHeight}px`
                  : 'none',
            }"
            :ref="popperKey"
            :class="[
               optionsContainerClass,
               { 'opacity-0 pointer-events-none': !opened },
               !opened && {
                  '!-mb-4': upside,
                  '!-mt-4': !upside,
               },
            ]">
            <div v-if="props.options" class="flex flex-col gap-1 text-white">
               <StSelectOption
                  v-for="(item, key) in props.options"
                  :key="key"
                  :value="item.value"
                  :selected="selectedSet.has(item.value)">
                  <div class="flex gap-2 items-center">
                     <StIcon v-if="item.icon" :name="item.icon" />
                     {{ item.label }}
                  </div>
               </StSelectOption>
            </div>
         </div>
      </Component>
   </div>
</template>
