<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import { useDefaultCursor } from '~/composables/use-default-cursor';

const props = defineProps<{
   direction: 'horizontal' | 'vertical';
   startPercent?: number;
}>();

const startPercentage = ref(props.startPercent ?? 50);
const endPercentage = ref(100 - (props.startPercent ?? 50));
const container = useTemplateRef('container');
const isDragging = ref(false);

// 处理拖拽事件
const handleResize = (event: MouseEvent) => {
   if (!container.value || isDragging.value || locked.value) return;
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

// 设置拖拽时的光标样式
const { set, reset } = useDefaultCursor({ el: container });
watch(isDragging, (val) => {
   if (val) {
      set(props.direction === 'horizontal' ? 'col-resize' : 'row-resize');
   } else {
      reset();
   }
});

// 自动调整面板大小以适应内容
const startPanel = useTemplateRef('startPanel');
const endPanel = useTemplateRef('endPanel');
const resizeToFit = async (place: 'start' | 'end') => {
   console.log('resize to fit');
   await nextTick();
   const panel = place === 'start' ? startPanel.value : endPanel.value;
   const side = props.direction === 'horizontal' ? 'width' : 'height';

   const size = panel?.firstElementChild?.getBoundingClientRect()[side] ?? 0;
   const containerSize = container.value?.getBoundingClientRect()[side] ?? 0;

   if (size && containerSize) {
      const newStartP = (size / containerSize) * 100;
      const resizerP = (12 / containerSize) * 100;

      const selfP = newStartP - resizerP / 2;
      const otherP = 100 - resizerP - newStartP;

      [startPercentage.value, endPercentage.value] =
         place === 'start' ? [selfP, otherP] : [otherP, selfP];
   }
};

// 面板状态存储与恢复
const storedState = {
   startPercentage: startPercentage.value,
   endPercentage: endPercentage.value,
};
const storePanelState = () => {
   storedState.startPercentage = startPercentage.value;
   storedState.endPercentage = endPercentage.value;
};
const restorePanelState = () => {
   startPercentage.value = storedState.startPercentage;
   endPercentage.value = storedState.endPercentage;
};

// 锁定面板比例
const locked = ref(false);
const setPanelLockState = (state: boolean) => {
   locked.value = state;
};

export interface IPanelMethods {
   resizeToFit: () => Promise<void>;
   setPanelLockState: (state: boolean) => void;
   storePanelState: () => void;
   restorePanelState: () => void;
}

// 提供给子组件的方法
const methodsToProvide = {
   start: {
      resizeToFit: () => resizeToFit('start'),
      setPanelLockState,
      storePanelState,
      restorePanelState,
   } satisfies IPanelMethods,
   end: {
      resizeToFit: () => resizeToFit('end'),
      setPanelLockState,
      storePanelState,
      restorePanelState,
   } satisfies IPanelMethods,
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
         ref="startPanel"
         :style="{
            flexBasis: `${startPercentage}%`,
            pointerEvents: isDragging ? 'none' : 'auto',
         }"
         class="flex-shrink-0">
         <slot name="start" v-bind="methodsToProvide.start"></slot>
      </div>
      <!-- RESIZER -->
      <div
         @mousedown.left="handleResize"
         class="flex items-center justify-center hover:bg-secondary group transition-colors shrink-0 rounded-full"
         :class="{
            'w-1 h-full mx-1 hover:cursor-col-resize':
               direction === 'horizontal',
            'w-full h-1 my-1 hover:cursor-row-resize': direction === 'vertical',
            '!bg-secondary': isDragging,
            'opacity-0 hover:!cursor-default': locked,
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
         ref="endPanel"
         :style="{
            flexBasis: `calc(${endPercentage}% - .25rem)`,
            pointerEvents: isDragging ? 'none' : 'auto',
         }"
         class="flex-shrink-0">
         <slot name="end" v-bind="methodsToProvide.end"></slot>
      </div>
   </div>
</template>
