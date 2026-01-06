<script setup lang="ts">
import { Box } from '@icon-park/vue-next';
import type { DefineComponent } from 'vue';

const props = defineProps<{
   content: string;
   icon?: DefineComponent;
}>();
</script>

<template>
   <StSpace fill center>
      <StSpace
         direction="vertical"
         gap="1.5rem"
         align="center"
         class="text-accent-300">
         <component :is="icon ?? Box" size="4rem" stroke-width="2px" />
         <div class="text-center text-muted">{{ props.content }}</div>
      </StSpace>
   </StSpace>
</template>
