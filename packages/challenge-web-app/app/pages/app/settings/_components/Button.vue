<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{
   level?: 'primary' | 'secondary';
   disabled?: boolean;
}>();
</script>

<template>
   <StRippleEffect>
      <StButton
         theme="primary"
         :class="[
            '!h-10 !rounded-md shrink-0 !font-normal text-sm whitespace-nowrap',
            level === 'secondary'
               ? '!px-0 !text-secondary !bg-transparent'
               : '!px-4 !bg-secondary hover:!bg-secondary/90 !border-secondary/75 !text-background',
            { 'opacity-75 cursor-not-allowed': disabled },
         ]"
         :disabled="disabled"
         v-bind="$attrs">
         <slot></slot>
      </StButton>
   </StRippleEffect>
</template>
