<script setup lang="tsx">
import {
   CheckSmall,
   CloseSmall,
   DocDetail,
   LoadingFour,
} from '@icon-park/vue-next';
import { type CommitDetailType } from './shared-types';
import dayjs from 'dayjs';
import { DataBlock, Divider, JudgeStatus } from './DetailItems';
import CommitDetailSkeleton from './skeleton/CommitDetailSkeleton.vue';

const props = defineProps<{
   recordId: number | null;
}>();

const loading = ref(false);
const { $trpc } = useNuxtApp();
const detail = ref<CommitDetailType | null>(null);
const lastRecordId = ref<number | null>(null);
const recordCaches = new Map<number, CommitDetailType>();

const getDetail = async () => {
   if (props.recordId === null) {
      detail.value = null;
      return;
   }
   if (props.recordId === lastRecordId.value) return;
   lastRecordId.value = props.recordId;

   if (recordCaches.has(props.recordId)) {
      detail.value = recordCaches.get(props.recordId)!;
      return;
   }

   loading.value = true;
   // @ts-ignore
   detail.value = await atLeastTime(
      500,
      $trpc.protected.problem.getCommitRecordDetail.query({
         judgeRecordId: props.recordId,
      })
   );
   loading.value = false;

   if (detail.value && detail.value.result !== 'pending') {
      recordCaches.set(props.recordId, detail.value);
   }
};
onMounted(() => {
   const dispose = watchEffect(getDetail);
   onUnmounted(dispose);
});

const formattedDate = computed(() => {
   if (!detail.value) return '';
   return dayjs(detail.value.createdAt).format('YYYY/MM/DD HH:mm:ss');
});

const judgeResult = computed<any>(() => {
   // @ts-ignore
   return detail.value
      ? detail.value?.result === 'pending'
         ? null
         : Array.isArray(detail.value?.info)
         ? detail.value?.info
         : null
      : null;
});

const StatusIcon = () => {
   if (detail.value?.result === 'success') {
      return <CheckSmall class='text-success' />;
   } else if (detail.value?.result === 'failed') {
      return <CloseSmall class='text-error' />;
   } else {
      return <LoadingFour class='animate-spin text-warning' />;
   }
};
</script>

<template>
   <StSpace
      direction="vertical"
      fill
      align="center"
      class="bg-[#1C1C1C] rounded-xl p-3">
      <div class="w-[34rem] h-full relative overflow-auto hide-scrollbar">
         <StSkeleton :loading="loading || !detail">
            <template #loading>
               <CommitDetailSkeleton />
            </template>
            <StSpace
               class="w-[34rem] min-h-full absolute top-0 left-0"
               gap="0.75rem"
               direction="vertical">
               <StSpace fill-x justify="between" align="center">
                  <StSpace gap="0.25rem" align="center">
                     <span class="!font-family-manrope font-bold text-warning">
                        #{{ recordId }}
                     </span>
                     <span class="st-font-body-normal">
                        {{ detail?.problem.title }}
                     </span>
                  </StSpace>
                  <StatusIcon />
               </StSpace>
               <StSpace
                  fill-x
                  class="py-4 px-5 rounded-[0.375rem] border border-secondary"
                  direction="vertical"
                  gap="1.5rem">
                  <StSpace fill-x gap="0.75rem" align="center">
                     <StAvatar size="2rem" />
                     <div>
                        <span class="st-font-body-bold">
                           {{ detail?.user.name }}
                        </span>
                        <span class="st-font-body-normal text-accent-300">
                           提交于
                        </span>
                        <span class="font-family-manrope">
                           {{ formattedDate }}
                        </span>
                     </div>
                  </StSpace>
                  <StSpace fill-x align="center">
                     <DataBlock title="提交状态">
                        <JudgeStatus :status="detail?.result!" />
                     </DataBlock>
                     <DataBlock title="最终得分">
                        {{ detail?.score ?? '---' }}
                     </DataBlock>
                     <DataBlock title="判题耗时">
                        {{ detail?.judgingTime ?? '---' }}ms
                     </DataBlock>
                     <DataBlock title="等待耗时">
                        {{ detail?.pendingTime ?? '---' }}ms
                     </DataBlock>
                  </StSpace>
                  <Divider />
                  <StSpace fill-x direction="vertical" gap="1rem">
                     <StSpace align="center" gap="0.25rem">
                        <DocDetail />
                        <span class="st-font-body-bold">判题详情</span>
                     </StSpace>
                     <StJudgeResult :judge-result="judgeResult" />
                  </StSpace>
               </StSpace>
            </StSpace>
         </StSkeleton>
      </div>
   </StSpace>
</template>

<style src="@/assets/css/utils.css" scoped />
