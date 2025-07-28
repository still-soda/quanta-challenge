<script setup lang="ts">
import {
   DailyChallengeCard,
   RecentLearningCard,
   RecentSubmissionCard,
   SubmissionStatusCard,
   BadgesCard,
   RankingCard,
} from './components';
</script>

<template>
   <StSpace direction="vertical" align="center" gap="0" class="h-full">
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
            <DailyChallengeCard />
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
