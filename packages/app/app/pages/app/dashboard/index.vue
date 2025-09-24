<script setup lang="ts">
import {
   DailyChallengeCard,
   RecentLearningCard,
   RecentSubmissionCard,
   SubmissionStatusCard,
   BadgesCard,
   RankingCard,
} from './_modules';

useSeoMeta({ title: '仪表盘 - Quanta Challenge' });
</script>

<template>
   <StSpace direction="vertical" align="center" gap="0" fill-y>
      <StSpace gap="1.5rem" fill class="px-4 py-6 max-w-[80.68rem] shrink-0">
         <StSpace direction="vertical" align="start" gap="1.5rem" fill>
            <h1 class="st-font-hero-bold">早上好，没有气的汽水</h1>
            <StSpace gap="1.5rem" fill-x class="mt-4">
               <RecentSubmissionCard />
               <RecentLearningCard />
            </StSpace>
            <DailyChallengeCard />
         </StSpace>
         <StSpace direction="vertical" gap="1.5rem" fill>
            <SubmissionStatusCard />
            <StSpace gap="1.5rem" fill>
               <RankingCard />
               <BadgesCard />
            </StSpace>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
