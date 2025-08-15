<script setup lang="ts">
import { Box } from '@icon-park/vue-next';

const props = defineProps<{
   content: string;
}>();
</script>

<template>
   <StSpace fill center>
      <StSpace
         direction="vertical"
         gap="1.5rem"
         align="center"
         class="text-accent-300">
         <Box size="4rem" />
         <div class="text-center text-muted">{{ props.content }}</div>
      </StSpace>
   </StSpace>
</template>
