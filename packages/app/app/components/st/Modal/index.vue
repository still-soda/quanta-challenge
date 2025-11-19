<script setup lang="ts">
import type { RendererElement } from 'vue';

defineProps<{
   attachTo?: string | RendererElement;
}>();

const opened = defineModel<boolean>('opened', {
   default: true,
});
</script>

<template>
   <Teleport :to="attachTo ?? 'body'">
      <StSpace
         fill
         center
         class="transition-all bg-background/10 backdrop-blur-xs z-[10000] fixed left-0 top-0"
         :class="{
            'pointer-events-auto opacity-100': opened,
            'pointer-events-none opacity-0': !opened,
         }">
         <div
            class="transition-all"
            :class="{
               'scale-100 opacity-100': opened,
               'scale-95 opacity-0': !opened,
            }">
            <slot> </slot>
         </div>
      </StSpace>
   </Teleport>
</template>
