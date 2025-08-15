<script setup lang="ts">
import { usePopper } from '~/composables/utils/use-popper';
import type { FormItemStatus } from '../Form/type';
import { Teleport } from 'vue';
import {
   TOGGLE_OPTION_INJECT_KEY,
   type ISelectOption,
   type ToggleOption,
} from './type';
import { Down, LoadingFour, RobotOne } from '@icon-park/vue-next';

const props = defineProps<{
   outerClass?: string;
   optionsContainerClass?: string;
   maxContainerHeight?: number;
   status?: FormItemStatus;
   placeholder?: string;
   attachToBody?: boolean;
   options?: ISelectOption[];
   multiple?: boolean;
   loading?: boolean;
   optionEmptyText?: string;
}>();

const selected = defineModel<any | any[]>('value', {
   default: '',
});
const borderClass = computed(() => {
   return props.status === 'error'
      ? '!border !border-error'
      : props.status === 'success'
      ? '!border !border-success'
      : '';
});

const opened = defineModel<boolean>('opened', {
   type: Boolean,
   default: false,
});
const toggleSelect = () => {
   opened.value = !opened.value;
};

const {
   containerKey,
   container,
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
   const resizeObserver = new ResizeObserver(() => {
      popperInstance.value?.update();
   });
   resizeObserver.observe(container.value!);
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

const optionEmptyText = computed(() => {
   return props.optionEmptyText ?? '暂无选项';
});
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
      <Down class="text-xl transition-all" :class="{ 'rotate-180': opened }" />

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
            <div
               v-if="props.options && !props.loading"
               class="flex flex-col gap-1 text-white">
               <slot v-if="!props.options.length" name="options-empty">
                  <div
                     class="w-fit mx-auto flex justify-center text-sm text-accent-300 h-10 items-center relative">
                     <RobotOne class="text-base absolute -left-5" />
                     <span>{{ optionEmptyText }}</span>
                  </div>
               </slot>
               <slot v-if="props.options.length" name="options-before"></slot>
               <StSelectOption
                  v-for="(item, key) in props.options"
                  :key="key"
                  :value="item.value"
                  :selected="selectedSet.has(item.value)">
                  <div class="flex gap-2 items-center">
                     <Component v-if="item.icon" :is="item.icon" />
                     <img
                        class="size-6 rounded-md overflow-hidden object-contain"
                        v-else-if="item.imageUrl"
                        :src="item.imageUrl"
                        :alt="item.label" />
                     {{ item.label }}
                  </div>
               </StSelectOption>
               <slot v-if="props.options.length" name="options-after"></slot>
            </div>
            <div
               v-else-if="props.loading"
               class="flex items-center justify-center h-10">
               <LoadingFour class="animate-spin text-primary text-base" />
            </div>
         </div>
      </Component>
   </div>
</template>
