<script setup lang="ts">
import { usePopper, type IUsePopperOptions } from '~/composables/use-popper';

const props = defineProps<{
   content?: string;
   placement?: NonNullable<IUsePopperOptions['options']>['placement'];
   zIndex?: number;
}>();

const { containerKey, popperKey, container, popperInstance } = usePopper({
   options: {
      placement: props.placement ?? 'auto',
   },
});

const triggered = ref(false);
const onMouseEnter = () => {
   popperInstance.value?.update();
   triggered.value = true;
};
const onMouseLeave = () => {
   triggered.value = false;
};
let observer: MutationObserver;
onMounted(() => {
   if (!container.value) return;
   container.value.addEventListener('mouseenter', onMouseEnter);
   container.value.addEventListener('mouseleave', onMouseLeave);
   observer = new MutationObserver(() => {
      popperInstance.value?.update();
   });
   observer.observe(container.value.parentNode!, {
      childList: true,
   });
   setTimeout(() => {
      popperInstance.value?.update();
   }, 200);
});
onUnmounted(() => {
   if (!container.value) return;
   container.value.removeEventListener('mouseenter', onMouseEnter);
   container.value.removeEventListener('mouseleave', onMouseLeave);
   observer?.disconnect();
});
</script>

<template>
   <Teleport to="body">
      <div
         :ref="popperKey"
         class="absolute transition-opacity !w-fit"
         :class="[triggered ? 'opacity-100' : 'opacity-0 pointer-events-none']"
         :style="{ zIndex: props.zIndex ?? 9998 }">
         <slot name="popper" :triggered>
            <div class="px-2 py-1 rounded-lg bg-accent-600 text-white">
               {{ content }}
            </div>
         </slot>
      </div>
   </Teleport>
   <div :ref="containerKey">
      <slot></slot>
   </div>
</template>
