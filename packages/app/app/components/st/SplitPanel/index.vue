<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

const props = defineProps<{
   direction: 'horizontal' | 'vertical';
}>();

const startPercentage = ref(50);
const endPercentage = ref(50);
const container = useTemplateRef('container');
const isDragging = ref(false);

const handleResize = (event: MouseEvent) => {
   if (!container.value || isDragging.value) return;
   event.preventDefault();
   const startPanel = container.value.children[0] as HTMLElement;
   const endPanel = container.value.children[2] as HTMLElement;

   const isHorizontal = props.direction === 'horizontal';
   isDragging.value = true;

   // 根据方向获取相应的尺寸
   const startSize = isHorizontal
      ? startPanel.offsetWidth
      : startPanel.offsetHeight;
   const endSize = isHorizontal ? endPanel.offsetWidth : endPanel.offsetHeight;
   const totalSize = startSize + endSize;

   const onMouseMove = (moveEvent: MouseEvent) => {
      // 根据方向计算拖拽距离
      const delta = isHorizontal
         ? moveEvent.clientX - event.clientX
         : moveEvent.clientY - event.clientY;

      const newStartPercentage = ((startSize + delta) / totalSize) * 100;
      const newEndPercentage = ((endSize - delta) / totalSize) * 100;

      if (newStartPercentage >= 10 && newEndPercentage >= 10) {
         startPercentage.value = newStartPercentage;
         endPercentage.value = newEndPercentage;
      }
   };

   const onMouseUp = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
   };

   document.addEventListener('mousemove', onMouseMove);
   document.addEventListener('mouseup', onMouseUp);
};
</script>

<template>
   <div
      ref="container"
      class="w-full h-full flex"
      :class="{
         'flex-row': direction === 'horizontal',
         'flex-col': direction === 'vertical',
      }">
      <!-- START -->
      <div
         :style="{
            flexBasis: `calc(${startPercentage}% - .5rem)`,
         }"
         class="flex-shrink-0">
         <slot name="start"></slot>
      </div>
      <!-- RESIZER -->
      <div
         @mousedown.left="handleResize"
         class="flex items-center justify-center hover:bg-secondary group transition-colors shrink-0"
         :class="{
            'w-1 h-full mx-1 hover:cursor-col-resize':
               direction === 'horizontal',
            'w-full h-1 my-1 hover:cursor-row-resize': direction === 'vertical',
            '!bg-secondary': isDragging,
         }">
         <div
            class="rounded-xl group-hover:bg-primary bg-accent-600 transition-colors"
            :class="{
               'w-1 h-8': direction === 'horizontal',
               'w-8 h-1': direction === 'vertical',
               '!bg-primary': isDragging,
            }"></div>
      </div>
      <!-- END -->
      <div
         :style="{
            flexBasis: `calc(${endPercentage}% - .25rem)`,
         }"
         class="flex-shrink-0">
         <slot name="end"></slot>
      </div>
   </div>
</template>
