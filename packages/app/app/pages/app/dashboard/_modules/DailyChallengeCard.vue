<script setup lang="ts">
import { Calendar, CheckOne, FireTwo, Round } from '@icon-park/vue-next';
import DailyChallengeSkeleton from '../_skeletons/DailyChallengeSkeleton.vue';
import ProblemCard from '../_components/ProblemCard.vue';
import CheckinInfoSkeleton from '../_skeletons/CheckinInfoSkeleton.vue';

const { $trpc } = useNuxtApp();

export type DailyProblem = Awaited<
   ReturnType<typeof $trpc.public.daily.getProblem.query>
>;

const dailyProblem = ref<DailyProblem | null>(null);
onMounted(async () => {
   dailyProblem.value = await $trpc.public.daily.getProblem.query();
});

const continueCheckinCounts = ref<string | null>(null);
onMounted(async () => {
   const count = await $trpc.protected.daily.continuesCheckinCount.query();
   continueCheckinCounts.value = count.toString().padStart(2, '0');
});

const hasCheckedIn = ref<boolean | null>(null);
onMounted(async () => {
   hasCheckedIn.value = await $trpc.protected.daily.hasCheckedin.query();
});

const hasCompletedTodayChallenge = ref<boolean | null>(null);
onMounted(async () => {
   hasCompletedTodayChallenge.value =
      await $trpc.protected.daily.hasCompletedDailyProblem.query();
});

const isLoadingCheckinInfo = computed(() => {
   return (
      continueCheckinCounts.value === null ||
      hasCheckedIn.value === null ||
      hasCompletedTodayChallenge.value === null
   );
});
</script>

<template>
   <StCard :icon="Calendar" class="h-full" title="每日一题">
      <StSpace class="w-full h-full mt-5">
         <StSpace direction="vertical" gap="1rem" class="w-full h-full">
            <StDateIndicator class="w-full" />
            <div class="flex flex-1 min-h-0 overflow-hidden w-full relative">
               <StSkeleton :loading="!dailyProblem" class="h-full">
                  <template #loading>
                     <DailyChallengeSkeleton class="absolute" />
                  </template>
                  <a
                     :href="`/challenge/editor/${dailyProblem!.pid}`"
                     target="_blank">
                     <ProblemCard :problem="dailyProblem!" />
                  </a>
               </StSkeleton>
            </div>
            <div
               v-if="!dailyProblem"
               class="bottom-mask w-[calc(100%-2rem)] h-[4.125rem] absolute bottom-0"></div>
         </StSpace>
         <StSpace
            direction="vertical"
            gap="1rem"
            class="w-full"
            :class="[
               isLoadingCheckinInfo ? 'h-[calc(100%-3.25rem)]' : 'h-full',
            ]">
            <StSkeleton :loading="isLoadingCheckinInfo" class="h-full">
               <template #loading>
                  <CheckinInfoSkeleton />
               </template>

               <StSpace
                  fill-x
                  gap="0.5rem"
                  align="center"
                  class="h-[3.125rem] text-[1.25rem] font-bold">
                  本月已连续签到
                  <span class="text-[1.25rem] font-family-manrope text-primary">
                     {{ continueCheckinCounts }}
                  </span>
                  天
               </StSpace>
               <StSpace direction="vertical" gap="1rem" class="w-full h-full">
                  <StSpace
                     direction="vertical"
                     justify="end"
                     gap="0.625rem"
                     class="w-full h-full flex-1">
                     <StSpace gap="0.5rem" align="center">
                        <Round
                           v-if="!hasCompletedTodayChallenge"
                           class="text-accent-200" />
                        <CheckOne v-else class="text-secondary" />
                        <span class="st-font-capture"> 需要完成今日挑战 </span>
                     </StSpace>
                     <StButton
                        class="!bg-accent-400 !h-[2.25rem] w-full"
                        :disabled="
                           !hasCheckedIn || !!hasCompletedTodayChallenge
                        ">
                        <StSpace gap="0.5rem" align="center">
                           <FireTwo size="1.25rem" />
                           <span class="st-font-body-bold"> 签到 </span>
                        </StSpace>
                     </StButton>
                  </StSpace>
               </StSpace>
            </StSkeleton>
         </StSpace>
      </StSpace>
   </StCard>
</template>

<style scoped src="../_styles/index.css" />
