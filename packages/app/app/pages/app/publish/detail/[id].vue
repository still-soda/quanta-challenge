<script setup lang="tsx">
import {
   AuditFail,
   AuditPending,
   AuditSuccess,
} from './components/AuditStatus';
import DataItem from './components/DataItem.vue';
import FixedButton from './components/FixedButton.vue';
import { NotPassed, Published, Unpublished } from './components/PublishStatus';

const route = useRoute();
const id = route.params.id as string;
if (!id) {
   navigateTo('/app/publish');
}

const { $trpc } = useNuxtApp();
type DataType = Awaited<
   ReturnType<typeof $trpc.admin.problem.getPublishDetails.query>
>;
const detail = ref<DataType | null>(null);

const fetchPublishDetails = async () => {
   try {
      const data = await $trpc.admin.problem.getPublishDetails.query({
         problemId: Number(id),
      });
      detail.value = data;
   } catch (e: any) {
      navigateTo('/app/publish');
   }
   // 轮询
   if (detail.value?.status === 'draft') {
      setTimeout(() => {
         fetchPublishDetails();
      }, 3000);
   }
};
onMounted(fetchPublishDetails);

const judgeCode = computed(() => {
   return detail.value?.JudgeFile[0]?.judgeScript ?? '';
});
const publishDate = computed(() => {
   const date = detail.value?.createdAt ?? '';
   return date.split('T').join(' ').slice(0, 16);
});
const failedReason = computed<string>(() => {
   if (detail.value?.status !== 'invalid') return '';
   const judgeRecord = detail.value?.TemplateJudgeRecord[0]?.judgeRecord;
   if (judgeRecord?.info.errorMessage) {
      // @ts-ignore
      return judgeRecord.info.errorMessage;
   } else if (detail.value.totalScore !== judgeRecord?.score) {
      return `使用标准答案进行判题无法得到满分，总分应该为 ${detail.value.totalScore}，实际上为 ${judgeRecord?.score}。`;
   } else {
      return '';
   }
});
const judgeResult = computed(() => {
   const judgeRecord = detail.value?.TemplateJudgeRecord[0]?.judgeRecord;
   // @ts-ignore
   return judgeRecord
      ? judgeRecord?.result === 'pending'
         ? null
         : Array.isArray(judgeRecord?.info)
         ? judgeRecord?.info
         : null
      : null;
});
const AuditStatus = () => {
   if (detail.value?.status === 'draft') {
      return <AuditPending />;
   } else if (detail.value?.status === 'invalid') {
      return <AuditFail />;
   } else {
      return <AuditSuccess />;
   }
};
const PublishStatus = () => {
   if (detail.value?.status === 'published') {
      return <Published />;
   } else if (detail.value?.status === 'ready') {
      return <Unpublished />;
   } else {
      return <NotPassed />;
   }
};
const Difficulty = () => {
   if (detail.value?.difficulty === 'easy') {
      return <span class='text-success'>简单</span>;
   } else if (detail.value?.difficulty === 'medium') {
      return <span class='text-warning'>中等</span>;
   } else if (detail.value?.difficulty === 'hard') {
      return <span class='text-error'>困难</span>;
   } else {
      return <span>未知</span>;
   }
};

const onSwitchPublishStatus = ref(false);
const handleSwitchPublishStatus = async () => {
   onSwitchPublishStatus.value = true;
   try {
      const switchStatus = $trpc.admin.problem.setPublishStatus.mutate({
         problemId: Number(id),
         publish: detail.value?.status === 'published' ? false : true,
      });
      await atLeastTime(500, switchStatus);
      await fetchPublishDetails();
   } catch (e) {
      console.error(e);
   } finally {
      onSwitchPublishStatus.value = false;
   }
};
const switchButtonIcon = computed(() => {
   return detail.value?.status === 'published' ? 'Lock' : 'Unlock';
});
const showSwitchButton = computed(() => {
   const status = detail.value?.status;
   return status === 'published' || status === 'ready';
});
</script>

<template>
   <StSpace full justify="center" class="overflow-auto">
      <FixedButton
         v-if="showSwitchButton"
         @click="handleSwitchPublishStatus"
         :loading="onSwitchPublishStatus"
         :icon="switchButtonIcon"
         class="right-[1.82rem] bottom-[13.32rem]" />
      <FixedButton icon="Edit" class="right-[1.82rem] bottom-[7.57rem]" />
      <FixedButton icon="Return" class="right-[1.82rem] bottom-[1.82rem]" />
      <StSpace
         direction="vertical"
         gap="1.5rem"
         class="w-[44rem] pb-[10rem] my-6">
         <h1 class="st-font-hero-bold">发布详情</h1>
         <StSpace
            direction="vertical"
            gap="2rem"
            fill-x
            class="p-4 rounded-lg border border-secondary">
            <!-- Raw 0 -->
            <StSpace fill-x justify="between">
               <DataItem title="题目 ID">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-32 h-6" />
                     </template>
                     <span class="font-family-manrope">
                        {{ detail?.pid }}
                     </span>
                  </StSkeleton>
               </DataItem>
               <DataItem title="发布时间">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-32 h-6" />
                     </template>
                     <span class="font-family-manrope">
                        {{ publishDate }}
                     </span>
                  </StSkeleton>
               </DataItem>
            </StSpace>
            <!-- Raw 1 -->
            <StSpace fill-x justify="between">
               <DataItem title="题目标题">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-32 h-6" />
                     </template>
                     {{ detail?.title }}
                  </StSkeleton>
               </DataItem>
               <DataItem title="题目总分">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-32 h-6" />
                     </template>
                     <span class="font-family-manrope">
                        {{ detail?.totalScore }}
                     </span>
                  </StSkeleton>
               </DataItem>
            </StSpace>
            <!-- Raw 2 -->
            <StSpace fill-x justify="between">
               <DataItem title="发布状态">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-32 h-6" />
                     </template>
                     <PublishStatus />
                  </StSkeleton>
               </DataItem>
               <DataItem title="审核状态">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-32 h-6" />
                     </template>
                     <AuditStatus />
                  </StSkeleton>
               </DataItem>
            </StSpace>
            <!-- Raw 3 -->
            <StSpace fill-x justify="between">
               <DataItem title="题目难度">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-32 h-6" />
                     </template>
                     <Difficulty />
                  </StSkeleton>
               </DataItem>
               <DataItem title="题目标签">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSpace gap="0.625rem">
                           <StSkeletonItem class="w-12 h-6" />
                           <StSkeletonItem class="w-12 h-6" />
                        </StSpace>
                     </template>
                     <StSpace class="font-light" gap="0.625rem">
                        <StTag
                           v-for="(item, idx) in detail?.tags ?? []"
                           :key="idx"
                           :content="item.name"
                           :color="item.color ?? undefined"
                           size="small" />
                     </StSpace>
                  </StSkeleton>
               </DataItem>
            </StSpace>
            <!-- Raw 4 -->
            <StSpace v-if="failedReason" fill-x justify="between">
               <DataItem title="失败原因" class="w-full">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-full h-64" />
                     </template>
                     <div
                        class="p-4 rounded-sm bg-accent-600 w-full font-normal font-family-fira-code">
                        <span class="text-error">{{ failedReason }}</span>
                     </div>
                  </StSkeleton>
               </DataItem>
            </StSpace>
            <!-- Raw 5 -->
            <StSpace fill-x justify="between">
               <DataItem title="判题脚本" class="w-full">
                  <StSkeleton :loading="!detail">
                     <template #loading>
                        <StSkeletonItem class="w-full h-64" />
                     </template>
                     <div
                        class="p-4 rounded-sm bg-accent-600 w-full font-normal overflow-auto">
                        <StCodePreview :code="judgeCode" />
                     </div>
                  </StSkeleton>
               </DataItem>
            </StSpace>
            <!-- Raw 6 -->
            <StSpace fill-x justify="between" v-if="judgeResult">
               <DataItem title="审核详情" class="w-full font-normal">
                  <StJudgeResult :judge-result="judgeResult" />
               </DataItem>
            </StSpace>
         </StSpace>
      </StSpace>
   </StSpace>
</template>
