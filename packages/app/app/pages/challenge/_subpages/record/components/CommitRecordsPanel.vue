<script setup lang="tsx">
import StSpace from '~/components/st/Space/index.vue';
import { CheckOne, CloseOne, LoadingFour } from '@icon-park/vue-next';
import dayjs from 'dayjs';
import CommitRecordSkeleton from './skeleton/CommitRecordSkeleton.vue';
import type { CommitRecordType } from './shared-types';

const props = defineProps<{ id: number }>();

const { $trpc } = useNuxtApp();

const records = ref<CommitRecordType[]>([]);
const loading = ref(false);
const getRecords = async () => {
   loading.value = true;
   if (!props.id || isNaN(props.id)) {
      throw new Error('Problem ID is required');
   }
   const records = await atLeastTime(
      500,
      $trpc.protected.problem.getAllCommitRecords.query({
         problemId: props.id,
      })
   );
   loading.value = false;
   return records;
};
onMounted(async () => {
   records.value = await getRecords();
   selectedRecord.value = records.value[0] ?? null;
   emits('select', selectedRecord.value!, true);
});

const currentComponent = inject<Ref<'editor' | 'record'> | undefined>(
   'currentComponent',
   undefined
)!;
watch(currentComponent, async (newVal) => {
   const opened = newVal === 'record';
   if (opened && !loading.value) {
      records.value = await getRecords();
      selectedRecord.value = records.value[0] ?? null;
      emits('select', selectedRecord.value!, true);
   }
});

const CommitRecord = ({
   record,
   selected,
}: {
   record: CommitRecordType;
   selected?: boolean;
}) => {
   const Icon =
      record.result === 'pending'
         ? LoadingFour
         : record.result === 'failed'
         ? CloseOne
         : CheckOne;

   const text =
      record.result === 'pending'
         ? '评测中...'
         : record.result === 'failed'
         ? '评测未通过'
         : '评测通过';

   const colorClass =
      record.result === 'pending'
         ? 'text-warning'
         : record.result === 'failed'
         ? 'text-error'
         : 'text-success';

   const formattedDate = dayjs(record.createdAt).format('YYYY/MM/DD HH:mm:ss');

   return (
      <StSpace
         fill-x
         class={[
            'px-3 py-2 rounded-lg transition-colors duration-100 hover:bg-accent-600 cursor-pointer',
            selected ? 'bg-accent-600' : '',
         ]}
         gap='0.5rem'
         align='center'>
         <Icon size='1.25rem' class={colorClass} />
         <StSpace direction='vertical' gap='0.1rem'>
            <div class={['st-font-caption !font-bold', colorClass]}>{text}</div>
            <div class='text-accent-200 text-sm !font-family-manrope font-light'>
               {formattedDate}
            </div>
         </StSpace>
      </StSpace>
   );
};

const selectedRecord = ref<CommitRecordType | null>(null);
const selectRecord = (record: CommitRecordType) => {
   selectedRecord.value = record;
};

const emits = defineEmits<{
   select: [record: CommitRecordType, isInit?: boolean];
}>();
watch(selectedRecord, (newRecord) => {
   if (newRecord) {
      emits('select', newRecord);
   }
});
</script>

<template>
   <StSpace
      direction="vertical"
      fill
      class="bg-[#1C1C1C] rounded-xl p-3"
      gap="1rem">
      <StSpace
         fill-x
         justify="between"
         align="center"
         class="text-accent-200"
         gap="0">
         <h2 class="st-font-body-normal overflow-ellipsis line-clamp-1">
            提交记录
         </h2>
      </StSpace>
      <StSpace fill class="relative overflow-auto hide-scrollbar">
         <StSpace
            direction="vertical"
            fill
            gap="0.5rem"
            class="absolute left-0 top-0">
            <StSkeleton :loading="loading">
               <template #loading>
                  <CommitRecordSkeleton />
               </template>
               <CommitRecord
                  v-for="record in records"
                  @click="selectRecord(record)"
                  :selected="selectedRecord === record"
                  :key="record.createdAt"
                  :record="record" />
            </StSkeleton>
         </StSpace>
      </StSpace>
   </StSpace>
</template>

<style src="@/assets/css/utils.css" scoped />
