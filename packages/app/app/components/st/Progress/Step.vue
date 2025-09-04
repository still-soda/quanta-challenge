<script setup lang="tsx">
import type { IProgressStep } from './type';
import { CheckOne, CloseOne, LoadingFour, Round } from '@icon-park/vue-next';

const props = defineProps<{
   direction: 'vertical' | 'horizontal';
   step: IProgressStep;
   isLast?: boolean;
}>();

const StatusIcon = () => {
   if (props.step.Icon) {
      return <props.step.Icon />;
   }
   if (props.step.status === 'completed') {
      return <CheckOne class='text-success' size='1rem' />;
   } else if (props.step.status === 'inProgress') {
      return <LoadingFour class='text-warning animate-spin' size='1rem' />;
   } else if (props.step.status === 'error') {
      return <CloseOne class='text-error' size='1rem' />;
   } else {
      return <Round class='text-accent-400' size='1rem' />;
   }
};
</script>

<template>
   <StSpace
      :fill-x="!props.isLast"
      gap="0.375rem"
      :direction="direction"
      justify="center">
      <StSpace gap="0.25rem" align="center" direction="vertical">
         <StatusIcon />
         <span
            v-if="props.step.title"
            class="st-font-tooltip text-white text-nowrap whitespace-nowrap">
            {{ props.step.title }}
         </span>
      </StSpace>
      <StSpace
         v-if="!props.isLast"
         align="center"
         justify="center"
         :class="[
            props.direction === 'horizontal' ? 'h-4 w-full' : 'w-4 h-full',
         ]">
         <div
            class="rounded-full"
            :class="[
               props.step.status === 'completed'
                  ? 'bg-success'
                  : 'bg-accent-400',
               props.direction === 'horizontal'
                  ? 'h-[1px] flex-1'
                  : 'w-[1px] flex-1',
            ]"></div>
      </StSpace>
   </StSpace>
</template>
