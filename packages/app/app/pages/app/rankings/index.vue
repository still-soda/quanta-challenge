<script setup lang="ts">
import { ToTop } from '@icon-park/vue-next';
import CurrentRankCard from './_components/CurrentRankCard.vue';
import ProfileCard from './_components/ProfileCard.vue';
import RankingTrendsCard from './_components/RankingTrendsCard.vue';
import RankTable from './_components/RankTable.vue';
import type { IRanking } from './_types';
import defaultAvatar from '@/assets/images/default-avatar.png';
import useAuthStore from '~/stores/auth-store';

const { $trpc } = useNuxtApp();

const { data: rankings, pending: loadingRankings } = useAsyncData(
   'rankings',
   () => $trpc.public.rank.getGlobalRankings.query(),
   {
      transform: (data): IRanking[] =>
         data.map((item) => ({
            userId: item.userId,
            correctRate: item.correctRate,
            imageUrl: item.avatarUrl ?? defaultAvatar,
            rank: item.rank,
            score: item.score,
            submissions: item.passCount,
            userName: item.userName,
         })),
   }
);

const rankContainer = useTemplateRef('rankContainer');
const showToTop = ref(false);
onMounted(() => {
   if (!rankContainer.value) return;
   const scrollHandler = useThrottleFn(() => {
      showToTop.value = rankContainer.value
         ? rankContainer.value.$el.scrollTop > 300
         : false;
   }, 100);
   rankContainer.value.$el.addEventListener('scroll', scrollHandler);

   const timer = setInterval(scrollHandler, 1000);

   onBeforeUnmount(() => {
      rankContainer.value?.$el.removeEventListener('scroll', scrollHandler);
      clearInterval(timer);
   });
});

const handleToTop = () => {
   if (!rankContainer.value) return;
   rankContainer.value.$el.scrollTo({
      top: 0,
      behavior: 'smooth',
   });
};

const authStore = useAuthStore();
const isListed = computed(() => {
   if (!rankings.value || !authStore.user) return false;
   return rankings.value.some((item) => item.userId === authStore.user!.id);
});
</script>

<template>
   <StSpace fill-y justify="center" gap="1.25rem" class="pt-6 relative">
      <StSpace
         ref="rankContainer"
         fill-y
         direction="vertical"
         align="center"
         class="hide-scrollbar pb-48 relative"
         :class="{ 'overflow-auto': !loadingRankings }">
         <h1 class="text-[2.5rem] font-bold text-white w-full">排行榜</h1>
         <RankTable :data="rankings ?? []" :loading="loadingRankings" />
         <StSpace
            @click="handleToTop"
            class="fixed bottom-6 bg-accent-500 opacity-60 hover:opacity-100 cursor-pointer border border-transparent hover:border-secondary transition-all p-4 py-2 rounded-lg"
            :class="{
               '!opacity-0 translate-y-4 pointer-events-none': !showToTop,
            }"
            gap="0.5rem"
            align="center">
            <ToTop />
            返回顶部
         </StSpace>
      </StSpace>
      <StSpace
         class="h-[calc(100vw-5.75rem)] w-[18.875rem] relative overflow-scroll hide-scrollbar pb-32">
         <StSpace
            direction="vertical"
            align="center"
            gap="0.75rem"
            class="top-0 left-0 absolute h-[93rem]">
            <ProfileCard />
            <CurrentRankCard :is-listed="isListed" />
            <RankingTrendsCard />
         </StSpace>
      </StSpace>
   </StSpace>
</template>

<style src="@/assets/css/utils.css" scoped />
