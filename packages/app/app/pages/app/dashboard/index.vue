<script setup lang="ts">
import {
   DailyChallenge,
   MoreOptions,
   RecentLearningCard,
   RecentSubmissionCard,
   SubmissionStatusCard,
} from './components';
import BadgesCard from './components/BadgesCard.vue';
import RankingCard from './components/RankingCard.vue';
</script>

<template>
   <StSpace direction="vertical" align="center" gap="0" class="h-full">
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
            <SubmissionStatusCard />
            <StSpace gap="1.5rem" class="w-full h-full">
               <RankingCard />
               <BadgesCard />
            </StSpace>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
