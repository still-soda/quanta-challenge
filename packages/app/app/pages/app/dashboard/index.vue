<script setup lang="ts">
import {
   DailyChallenge,
   MoreOptions,
   RecentLearningCard,
   RecentSubmissionCard,
} from './components';
</script>

<template>
   <StSpace direction="vertical" align="center" gap="1.5rem" class="h-full">
      <StHeader>
         <template #left>
            <StSpace gap="0.75rem" align="center">
               <StHeaderButton text="搜索">
                  <StIcon name="Search" class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton text="通知">
                  <StIcon name="Remind" class="text-[1.25rem]" />
               </StHeaderButton>
            </StSpace>
         </template>
         <template #right>
            <StHeaderProfile name="没有气的汽水" desc="20th前端CEO" />
         </template>
      </StHeader>
      <StSpace gap="1.5rem" class="w-full h-full px-4 py-6 max-w-[80.68rem]">
         <StSpace
            direction="vertical"
            align="start"
            gap="1.5rem"
            class="w-full h-full">
            <h1 class="text-[2.5rem] font-bold">早上好，没有气的汽水</h1>
            <StSpace gap="1.5rem" class="mt-4 w-full">
               <RecentSubmissionCard />
               <RecentLearningCard />
            </StSpace>
            <DailyChallenge />
         </StSpace>

         <StSpace direction="vertical" gap="1.5rem" class="w-full h-full">
            <StCard
               icon="Fire"
               title="提交情况"
               class="w-full !h-[18.0625rem] mt-4"></StCard>
            <StSpace gap="1.5rem" class="w-full h-full">
               <StCard icon="Ranking" title="我的排名" class="w-full h-full">
                  <template #header-right>
                     <MoreOptions />
                  </template>
               </StCard>
               <StCard
                  icon="FiveStarBadge"
                  title="徽章墙"
                  class="w-full h-full">
                  <template #header-right>
                     <MoreOptions />
                  </template>
               </StCard>
            </StSpace>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
