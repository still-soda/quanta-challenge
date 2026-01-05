<script setup lang="ts">
import useAuthStore from '~/stores/auth-store';
import {
   DailyChallengeCard,
   RecentLearningCard,
   RecentSubmissionCard,
   SubmissionStatusCard,
   AchievementsCard,
   RankingCard,
} from './_modules';

useSeoMeta({ title: '仪表盘 - Quanta Challenge' });

const authStore = useAuthStore();

const username = computed(
   () => authStore.user?.displayName || authStore.user?.name || '用户'
);

const greeting = computed(() => {
   const hour = new Date().getHours();
   if (hour >= 5 && hour < 12) return '☀️ 早上好';
   if (hour >= 12 && hour < 18) return '🌤 下午好';
   return '🌙 晚上好';
});
</script>

<template>
   <StSpace direction="vertical" align="center" gap="0">
      <StSpace gap="1.5rem" fill class="px-4 py-6 max-w-[80.68rem] shrink-0">
         <StSpace direction="vertical" align="start" gap="1.5rem" fill>
            <h1 class="st-font-hero-bold">{{ greeting }}，{{ username }}</h1>
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
               <AchievementsCard />
            </StSpace>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
