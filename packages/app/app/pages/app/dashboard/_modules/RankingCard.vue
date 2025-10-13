<script setup lang="ts">
import { Ranking, TrendingDown, TrendingUp } from '@icon-park/vue-next';
import MoreOptions from './MoreOptions.vue';
import RankingSkeleton from '../_skeletons/RankingSkeleton.vue';
import LineChart from '../_components/LineChart.vue';

type Ranking = { from: number; to: number; count: number };

const { $trpc } = useNuxtApp();
const rankings = ref<Ranking[] | null>(null);
const statistics = ref({ score: 0, rank: 0, beatRatio: 0 });
onMounted(async () => {
   const data = await $trpc.protected.rank.getMyGlobalRankStatistic.query();

   statistics.value = {
      score: data.selfRanking.score,
      rank: data.selfRanking.rank,
      beatRatio: data.selfRanking.aheadRate,
   };
   rankings.value = data.rankingIntervals;
});

const trends = ref<number[] | null>(null);
onMounted(async () => {
   const data = await $trpc.protected.rank.getMyRankingTrends.query();
   trends.value = data;
});

const loading = computed(() => !rankings.value || !trends.value);

const beatRadio = computed(() => {
   if (!statistics.value) return '--';
   return (statistics.value.beatRatio * 100).toFixed(0) + '%';
});

const increaseRatio = computed(() => {
   if (!trends.value) return 0;
   const [lastRank, currRank] = trends.value.slice(-2) as [number, number];
   const delta = lastRank - currRank;
   return (delta / lastRank) * 100;
});

const increaseRatioText = computed(() => {
   const ratio = (increaseRatio.value * 100).toFixed(2) + '%';
   return increaseRatio.value >= 0 ? `+${ratio}` : ratio;
});
</script>

<template>
   <StCard :icon="Ranking" title="我的排名" class="w-full h-full">
      <template #header-right>
         <MoreOptions />
      </template>
      <RankingSkeleton v-if="loading" />
      <StSpace v-else fill direction="vertical" gap="1.25rem" class="mt-7">
         <StSpace fill-x direction="vertical" gap="1rem">
            <StSpace gap="0.25rem">
               <div
                  class="font-family-manrope text-[3rem] leading-[2.25rem] font-bold">
                  {{ statistics.score }}
               </div>
               <div class="st-font-body-normal">分</div>
            </StSpace>
            <StSpace fill-x gap="0">
               <StSpace fill-x direction="vertical" gap="0.5rem">
                  <div class="st-font-body-normal text-accent-200">
                     全站排名
                  </div>
                  <div
                     class="leading-[90%] font-family-manrope font-bold text-white">
                     {{ statistics.rank }}
                  </div>
               </StSpace>
               <StSpace fill-x direction="vertical" gap="0.5rem">
                  <div class="st-font-body-normal text-accent-200">
                     超越人数占比
                  </div>
                  <div
                     class="leading-[90%] font-family-manrope font-bold text-white">
                     {{ beatRadio }}
                  </div>
               </StSpace>
            </StSpace>
         </StSpace>

         <StSpace fill class="max-h-[13rem]">
            <StRankingChart
               :rank="rankings ?? []"
               :current-score="statistics.score" />
         </StSpace>

         <StDivider simple />

         <StSpace fill-x direction="vertical" gap="0.75rem">
            <StSpace fill-x justify="between">
               <div>排名变化</div>
               <StSpace
                  gap="0.25rem"
                  align="center"
                  class="py-1 px-[0.375rem] rounded-[0.375rem]"
                  :class="
                     increaseRatio >= 0
                        ? 'bg-secondary text-accent-600'
                        : 'bg-primary text-white'
                  ">
                  <TrendingUp
                     v-if="increaseRatio >= 0"
                     class="text-accent-700"
                     size="1rem" />
                  <TrendingDown v-else size="1rem" />
                  <div
                     class="text-[0.625rem] leading-[100%] font-bold font-family-manrope">
                     {{ increaseRatioText }}
                  </div>
               </StSpace>
            </StSpace>
            <StSpace fill-x class="flex-1" align="center">
               <LineChart
                  :data="trends ?? []"
                  :class="[
                     'h-16 my-6',
                     increaseRatio >= 0 ? 'text-secondary' : 'text-primary',
                  ]" />
            </StSpace>
         </StSpace>
      </StSpace>
   </StCard>
</template>
