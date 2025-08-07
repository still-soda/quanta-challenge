<script setup lang="ts">
import * as Icons from '@icon-park/vue-next';

const props = defineProps<{
   icon: keyof typeof Icons;
   loading?: boolean;
}>();

defineEmits(['click']);
</script>

<template>
   <StSpace
      center
      :class="[
         'size-[4.5rem] rounded-full bg-accent-600 text-accent-200 outline-1',
         'outline-transparent hover:outline-secondary hover:text-white transition-all cursor-pointer',
      ]"
      @click="$emit('click')">
      <StIcon
         size="2rem"
         :name="props.loading ? 'LoadingFour' : icon"
         :class="{ 'animate-spin text-accent-400': props.loading }" />
   </StSpace>
</template>
