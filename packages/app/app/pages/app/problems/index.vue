<script setup lang="tsx">
import type { $Enums } from '@prisma/client';
import SlideMask from './components/SlideMask.vue';
import Divider from './components/Divider.vue';
import { useViewTransition } from '~/composables/utils/use-view-transition';
import { ThreeHexagons } from '@icon-park/vue-next';

useSeoMeta({ title: '题目 - Quanta Challenge' });

const { $trpc } = useNuxtApp();

type TagsType = Awaited<ReturnType<typeof $trpc.public.tag.list.query>>;
const { data: tags, status: tagsStatus } = await useAsyncData<TagsType>(
   'tags',
   async () => await $trpc.public.tag.list.query()
);

const selectedTags = ref<number[]>([]);
const toggleTag = (id: number) => {
   const idx = selectedTags.value.indexOf(id);
   idx === -1 ? selectedTags.value.push(id) : selectedTags.value.splice(idx, 1);
   getPublicProblems();
};
const selectAll = () => {
   selectedTags.value = [];
   getPublicProblems();
};

type ProblemType = Awaited<
   ReturnType<typeof $trpc.public.problem.listPublicProblems.query>
>;
const problems = ref<ProblemType>();
const { startViewTransition } = useViewTransition();
let requestId = 0;
const getPublicProblems = async () => {
   const id = ++requestId;
   const result = await $trpc.public.problem.listPublicProblems.query({
      tids: selectedTags.value,
   });
   if (id !== requestId) return; // 如果请求被取消，则不更新
   startViewTransition(() => {
      problems.value = result;
   });
};
onMounted(getPublicProblems);

const PassRate = ({ rate }: { rate: number }) => {
   const passRate = rate.toFixed(2);
   return (
      <div class='font-bold font-family-manrope leading-[90%]'>{passRate}%</div>
   );
};
const Score = ({ score }: { score: number }) => {
   return (
      <div class='font-bold font-family-manrope leading-[90%]'>
         {score.toFixed(0)}
      </div>
   );
};
const Difficulty = ({ difficulty }: { difficulty: $Enums.Difficulty }) => {
   const difficultyMap: Record<$Enums.Difficulty, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      very_hard: '非常困难',
   };
   const colorClass: Record<$Enums.Difficulty, string> = {
      easy: 'text-secondary',
      medium: 'text-warning',
      hard: 'text-primary',
      very_hard: 'text-error',
   };
   return (
      <div
         class={[
            'font-bold font-family-manrope leading-[90%] ',
            colorClass[difficulty],
         ]}>
         {difficultyMap[difficulty]}
      </div>
   );
};
</script>

<template>
   <StSpace
      fill-y
      direction="vertical"
      align="center"
      gap="0"
      class="overflow-scroll hide-scrollbar">
      <StSpace fill-y direction="vertical" class="mt-6">
         <h1 class="text-[2.5rem] font-bold text-white">题目</h1>
         <StSkeleton :loading="tagsStatus === 'pending'" class="mt-4">
            <template #loading>
               <StSpace gap="0.75rem">
                  <StSkeletonItem
                     v-for="i in 3"
                     :key="i"
                     class="h-[3.5rem] w-32 !rounded-full" />
               </StSpace>
            </template>
            <StSpace fill-x class="h-[3.5rem] relative" gap="0">
               <StScrollable scroll-x fill class="relative hide-scrollbar">
                  <StSpace gap="0.75rem" class="absolute left-0 top-0">
                     <StTagButton
                        @click="selectAll"
                        :selected="selectedTags.length === 0"
                        :icon="ThreeHexagons"
                        :tag="{ name: '全部' }" />
                     <StTagButton
                        v-for="(tag, idx) in tags"
                        :key="idx"
                        :tag="tag"
                        :selected="selectedTags.includes(tag.tid)"
                        @click="toggleTag(tag.tid)" />
                     <div class="w-[2.5rem] h-[3.5rem] shrink-0"></div>
                  </StSpace>
               </StScrollable>
               <div class="h-[3.5rem]"></div>
               <SlideMask />
            </StSpace>
         </StSkeleton>
         <Divider />
         <StSkeleton :loading="!problems" class="w-full h-full">
            <template #loading>
               <StGrid fill :cols="4" gap="1.25rem">
                  <StSkeletonItem
                     v-for="i in 12"
                     :key="i"
                     class="w-[14.5rem] h-[20rem]"
                     rounded="lg" />
               </StGrid>
            </template>
            <StEmptyStatus
               v-if="!problems?.length"
               content="暂无题目"
               class="!w-[61.75rem] pb-32" />
            <StGrid v-else fill :cols="4" gap="1.25rem">
               <a
                  v-for="(problem, idx) in problems"
                  class="h-fit"
                  :style="{ viewTransitionName: `card-${problem.pid}` }"
                  :key="idx"
                  :href="`/challenge/editor/${problem.pid}`">
                  <StProblemCard
                     class="w-[14.5rem] h-fit"
                     :cover-image-name="problem.imageName">
                     <StProblemCardTitle :title="problem.title ?? '匿名题目'" />
                     <StProblemCardTags :tags="problem.tags ?? []" />
                     <StProblemCardDivider />
                     <StProblemCardInfo
                        class="pb-3"
                        :class="{ 'px-2': problem.difficulty !== 'very_hard' }">
                        <StProblemCardInfoItem title="通过率">
                           <PassRate :rate="problem.passRate!" />
                        </StProblemCardInfoItem>
                        <StProblemCardInfoItem title="分数">
                           <Score :score="problem.totalScore!" />
                        </StProblemCardInfoItem>
                        <StProblemCardInfoItem title="难度" center>
                           <Difficulty :difficulty="problem.difficulty!" />
                        </StProblemCardInfoItem>
                     </StProblemCardInfo>
                  </StProblemCard>
               </a>
            </StGrid>
         </StSkeleton>
         <StSpacer fill flex no-shrink height="1rem" />
      </StSpace>
   </StSpace>
</template>

<style scoped src="@/assets/css/utils.css" />
