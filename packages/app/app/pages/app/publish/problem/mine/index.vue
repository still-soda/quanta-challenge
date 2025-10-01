<script setup lang="tsx">
import { StSpace } from '#components';
import { $Enums } from '@prisma/client';
import { useViewTransition } from '~/composables/use-view-transition';
import Divider from '../_components/Divider.vue';
import { ThreeHexagons } from '@icon-park/vue-next';

useSeoMeta({ title: '我的发布 - Quanta Challenge' });

const { $trpc } = useNuxtApp();

// 获取我的发布题目
type ProblemsType = Awaited<ReturnType<typeof $trpc.admin.problem.list.query>>;
const problems = ref<ProblemsType | null>(null);
const { startViewTransition } = useViewTransition();
let requestId = 0;
const getMyPublishProblems = async () => {
   let id = ++requestId;
   const result = await $trpc.admin.problem.list.query({
      tids: selectedTags.value,
   });
   if (id !== requestId) return; // 如果请求被取消，则不更新
   startViewTransition(() => {
      problems.value = result;
   });
};
onMounted(() => {
   getMyPublishProblems();
});

// 获取我的标签
type TagsType = Awaited<
   ReturnType<typeof $trpc.admin.tag.getTagsInMyPublished.query>
>;
const tags = ref<TagsType | null>(null);
const getMyTags = async () => {
   tags.value = await $trpc.admin.tag.getTagsInMyPublished.query();
};
onMounted(getMyTags);

// 组件
const PublishDate = ({ problem }: { problem: ProblemsType[number] }) => {
   return (
      <div class='font-bold font-family-manrope leading-[90%]'>
         {problem.createdAt.split('T')[0]}
      </div>
   );
};
const ProblemStatus = ({ problem }: { problem: ProblemsType[number] }) => {
   const statusMap: Record<$Enums.Status, string> = {
      draft: '审核中',
      invalid: '审核失败',
      ready: '审核通过',
      published: '已发布',
   };
   const colorClass: Record<$Enums.Status, string> = {
      draft: 'text-warning',
      invalid: 'text-error',
      ready: 'text-success',
      published: 'text-secondary',
   };
   return (
      <div class={`font-bold leading-[90%] ${colorClass[problem.status]}`}>
         {statusMap[problem.status]}
      </div>
   );
};

// 选中标签
const selectedTags = ref<number[]>([]);
const toggleTag = (id: number) => {
   const idx = selectedTags.value.indexOf(id);
   idx === -1 ? selectedTags.value.push(id) : selectedTags.value.splice(idx, 1);
   getMyPublishProblems();
};
const selectAll = () => {
   selectedTags.value = [];
   getMyPublishProblems();
};

const showEmptyStatus = computed(() => {
   return Array.isArray(problems.value) && problems.value.length === 0;
});
</script>

<template>
   <StSpace
      fill-y
      direction="vertical"
      align="center"
      gap="0"
      class="overflow-auto hide-scrollbar">
      <StSpace
         v-if="showEmptyStatus"
         fill-y
         direction="vertical"
         class="mt-6 w-[50rem]">
         <h1 class="text-[2.5rem] font-bold text-white">我的发布</h1>
         <Divider />
         <StEmptyStatus content="暂无发布内容" class="pb-32" />
      </StSpace>
      <StSpace v-else fill-y direction="vertical" class="mt-6">
         <h1 class="text-[2.5rem] font-bold text-white">我的发布</h1>
         <StSkeleton :loading="!tags" class="mt-4">
            <template #loading>
               <StSpace gap="0.75rem">
                  <StSkeletonItem
                     v-for="i in 3"
                     :key="i"
                     class="h-[3.5rem] w-32 !rounded-full" />
               </StSpace>
            </template>
            <StSpace gap="0.75rem" class="mt-4">
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
            <StGrid fill :cols="4" gap="1.25rem">
               <NuxtLink
                  v-for="(problem, idx) in problems"
                  class="h-fit"
                  :style="{ viewTransitionName: `card-${problem.pid}` }"
                  :key="idx"
                  :to="`/app/publish/problem/detail/${problem.pid}`">
                  <StProblemCard
                     class="w-[14.5rem] h-fit"
                     :cover-image-name="problem.imageName">
                     <StProblemCardTitle :title="problem.title" />
                     <StProblemCardTags :tags="problem.tags" />
                     <StProblemCardDivider />
                     <StProblemCardInfo class="px-2 pb-3">
                        <StProblemCardInfoItem title="提交时间">
                           <PublishDate :problem="problem" />
                        </StProblemCardInfoItem>
                        <StProblemCardInfoItem title="状态">
                           <ProblemStatus :problem="problem" />
                        </StProblemCardInfoItem>
                     </StProblemCardInfo>
                  </StProblemCard>
               </NuxtLink>
            </StGrid>
         </StSkeleton>
         <StSpacer fill flex no-shrink height="1rem" />
      </StSpace>
   </StSpace>
</template>

<style scoped src="@/assets/css/utils.css" />
