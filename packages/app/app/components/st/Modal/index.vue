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
         class="transition-all bg-background/10 backdrop-blur-xs z-[10000] absolute left-0 top-0"
         :class="{
            'pointer-events-auto opacity-100': opened,
            'pointer-events-none opacity-0': !opened,
         }">
         <slot>
            <StSpace
               class="w-40 h-32 bg-accent-600 rounded-xl shadow-lg shadow-background">
            </StSpace>
         </slot>
      </StSpace>
   </Teleport>
</template>
