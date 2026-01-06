<script setup lang="ts">
import type { MenuItem } from './type';

defineProps<{
   menuItems: Array<MenuItem>;
   trigger?: 'hover' | 'click';
}>();

const { popperKey, containerKey } = usePopper({
   options: {
      placement: 'bottom-end',
   },
});

const opened = ref(false);

const bindingDom = computed(() => {
   return document?.body ?? null;
});
</script>

<template>
   <div :ref="containerKey" @click="opened = !opened">
      <slot></slot>
      <Teleport :to="bindingDom">
         <StSpace
            v-show="opened"
            class="bg-accent-600 text-accent-100 rounded-md shadow-lg gap-2 flex flex-col p-2 z-[10001] whitespace-nowrap text-nowrap">
            12344
         </StSpace>
      </Teleport>
   </div>
</template>
