<script setup lang="ts">
import defaultProfileBanner from '@/assets/images/default-profile-banner.png';

const { $trpc } = useNuxtApp();
const { data: commitStatistic, pending } = useAsyncData('profile', () =>
   $trpc.protected.problem.getCommitStatistic.query()
);

const correctRate = computed(() => {
   if (!commitStatistic.value) return '--%';
   return commitStatistic.value.correctRate.toFixed(2) + '%';
});
</script>

<template>
   <StSpace class="w-[18.875rem] p-2 pb-7 rounded-xl bg-accent-600 relative">
      <StSpace fill-x direction="vertical" align="center" class="mt-[5.62rem]">
         <StSpace
            class="w-[17.875rem] h-32 rounded-lg bg-accent-500 absolute top-2 left-2 overflow-hidden">
            <StSkeletonItem v-if="pending" class="size-full rounded-md" />
            <StImage v-else :src="defaultProfileBanner" class="size-full" />
         </StSpace>

         <StSpace direction="vertical" align="center" gap="0.75rem">
            <StSkeletonItem
               v-if="pending"
               class="size-[5.25rem] rounded-full z-10 border-4 border-accent-600" />
            <StImage
               v-else
               src="/_nuxt/assets/images/default-avatar.png"
               class="!rounded-full z-10 border-4 border-accent-600"
               width="5.25rem"
               height="5.25rem" />
            <StSpace direction="vertical" align="center" gap="0.375rem">
               <div class="st-font-body-bold">没有气的汽水</div>
               <div class="st-font-caption">20th前端经理</div>
            </StSpace>
         </StSpace>

         <StDivider simple />

         <StSpace fill-x justify="between" class="px-8">
            <template v-if="pending">
               <StSpace
                  v-for="i in 3"
                  :key="i"
                  direction="vertical"
                  gap="0.5rem">
                  <StSkeletonItem
                     class="w-[3.75rem] h-[1.3125rem] rounded-md" />
                  <StSkeletonItem
                     class="w-[2.75rem] h-[1.3125rem] rounded-md" />
               </StSpace>
            </template>
            <template v-else>
               <StSpace direction="vertical" gap="0.5rem" align="center">
                  <div class="st-font-body-normal text-accent-200">得分</div>
                  <div class="leading-[90%] font-family-manrope font-bold">
                     {{ commitStatistic?.score }}
                  </div>
               </StSpace>
               <StSpace direction="vertical" gap="0.5rem" align="center">
                  <div class="st-font-body-normal text-accent-200">准确率</div>
                  <div
                     class="leading-[90%] font-family-manrope font-bold text-success">
                     {{ correctRate }}
                  </div>
               </StSpace>
               <StSpace direction="vertical" gap="0.5rem" align="center">
                  <div class="st-font-body-normal text-accent-200">作答数</div>
                  <div class="leading-[90%] font-family-manrope font-bold">
                     {{ commitStatistic?.passCount }}
                  </div>
               </StSpace>
            </template>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
