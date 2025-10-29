<script setup lang="ts">
import { Box, Share, TableReport } from '@icon-park/vue-next';
import StackRank from '../_components/StackRank.vue';
import LinkButton from '../_components/LinkButton.vue';

const { $trpc } = useNuxtApp();

const { data: submissionData, pending: loading } = useAsyncData(
   'recent-submission',
   () => $trpc.protected.dashboard.getRecentSubmissions.query()
);

const detailPath = computed(() => {
   const { problemId, recordId } = submissionData.value || {};
   return submissionData.value
      ? `/challenge/record/${problemId}?id=${recordId}`
      : '#';
});

type Payload<T extends string> = {
   required: T[];
   condition: (ctx: Record<T, any>) => boolean;
   progress?: (ctx: Record<T, any>) => number;
   hintText?: (ctx: Record<T, any>) => string;
};

function rule<T extends string>(payload: Payload<T>) {
   return (value: Record<T, any>) => {
      if (payload.condition(value)) {
         for (const field of payload.required) {
            if (value[field] === undefined || value[field] === null) {
               return false;
            }
         }
      }
      return true;
   };
}

rule({
   required: ['submissionData'],
   condition: (ctx) => !!ctx.submissionData,
});
</script>

<template>
   <StCard title="最近提交" class="aspect-square select-none" bordered>
      <template #header-right>
         <LinkButton
            v-if="submissionData"
            open-in-new-tab
            :to="detailPath"
            description="查看详情" />
      </template>

      <StSpace
         v-if="submissionData"
         direction="vertical"
         gap="1.25rem"
         class="mt-6 w-full h-full">
         <StSkeleton :loading="loading">
            <template #loading>
               <StSpace gap="1rem">
                  <StSkeletonItem class="h-5 w-full" />
                  <StSkeletonItem class="h-5 w-[2.6875rem]" />
               </StSpace>
            </template>
            <StSpace gap="1rem" class="pt-1" align="center" fill-x>
               <StSpace gap="0.5rem" align="center" fill-x>
                  <TableReport />
                  <span
                     class="line-clamp-1 overflow-ellipsis st-font-body-normal">
                     {{ submissionData!.title }}
                  </span>
               </StSpace>
               <StSpace
                  class="py-1 px-2 rounded-md bg-secondary st-font-tooltip text-accent-700 whitespace-nowrap text-nowrap">
                  已通过
               </StSpace>
            </StSpace>
         </StSkeleton>

         <StSkeleton class="h-full" :loading="loading">
            <template #loading>
               <StSpace gap="1rem" class="h-full">
                  <StSkeletonItem class="h-full w-full" />
                  <StSkeletonItem class="h-full w-full" />
               </StSpace>
            </template>
            <StSpace gap="0.5rem" fill-x align="center">
               <StSpace gap="1.5rem" fill-x align="center" justify="center">
                  <StSpace gap="0.25rem" align="start">
                     <span
                        class="text-[4rem] leading-[3.2rem] font-bold text-transparent bg-gradient-to-br from-success via-secondary to-success bg-clip-text font-family-manrope">
                        {{ submissionData!.score || '--' }}
                     </span>
                     <span class="st-font-body-normal">分</span>
                  </StSpace>
                  <StackRank
                     :percent="submissionData!.aheadRate"
                     class="!w-20" />
               </StSpace>
            </StSpace>
         </StSkeleton>

         <div v-if="!loading" class="w-full h-[0.0625rem] bg-accent-400"></div>

         <StSkeleton :loading="loading">
            <template #loading>
               <StSpace gap="1rem">
                  <StSpace
                     v-for="i in 3"
                     :key="i"
                     direction="vertical"
                     gap="0.5rem"
                     class="w-full">
                     <StSkeletonItem class="h-5 w-full" />
                     <StSkeletonItem class="h-5 w-[3.4rem]" />
                  </StSpace>
               </StSpace>
            </template>
            <StSpace justify="between" class="px-3" gap="0" fill-x>
               <StSpace direction="vertical" gap="0.5rem">
                  <div
                     class="st-font-normal-body text-accent-200 text-nowrap whitespace-nowrap">
                     平均通过
                  </div>
                  <div class="font-bold font-family-manrope leading-[90%]">
                     {{ (submissionData!.passRate * 100).toFixed(2) }} %
                  </div>
               </StSpace>
               <StSpace direction="vertical" gap="0.5rem">
                  <div
                     class="st-font-normal-body text-accent-200 text-nowrap whitespace-nowrap">
                     等待耗时
                  </div>
                  <div class="font-bold font-family-manrope leading-[90%]">
                     {{ submissionData!.pendingTime }}ms
                  </div>
               </StSpace>
               <StSpace direction="vertical" gap="0.5rem">
                  <div
                     class="st-font-normal-body text-accent-200 text-nowrap whitespace-nowrap">
                     判题耗时
                  </div>
                  <div class="font-bold font-family-manrope leading-[90%]">
                     {{ submissionData!.judgingTime }}ms
                  </div>
               </StSpace>
            </StSpace>
         </StSkeleton>
      </StSpace>

      <StSpace
         v-else
         fill
         direction="vertical"
         gap="0.75rem"
         align="center"
         justify="center"
         class="text-accent-400 pb-4">
         <Box size="2.625rem" />
         <div class="st-font-body-normal">暂无提交记录</div>
      </StSpace>
   </StCard>
</template>
