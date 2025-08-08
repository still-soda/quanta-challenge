<script setup lang="ts">
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
         <StIcon size="4rem" name="Box" />
         <div class="text-center text-muted">{{ props.content }}</div>
      </StSpace>
   </StSpace>
</template>
