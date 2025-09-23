<script setup lang="ts">
import CommitRecordsPanel from './components/CommitRecordsPanel.vue';
import CommitDetailPanel from './components/CommitDetailPanel.vue';
import type { CommitRecordType } from './components/shared-types';
import { useQuery } from '~/composables/utils/use-query';

const props = defineProps<{ id: number }>();

definePageMeta({
   layout: 'challenge-layout',
});

const initRecordId = useQuery('id', {
   parse(value) {
      const id = Number(value);
      return isNaN(id) ? null : id;
   },
});

const selectedRecordId = ref<number | null>(initRecordId.value ?? null);
const handleSelectRecord = (record: CommitRecordType, isInit = false) => {
   if (isInit && selectedRecordId.value !== null) return;
   selectedRecordId.value = record.id;
};
</script>

<template>
   <StSpace fill center class="p-4 pr-6 pt-0">
      <StSplitPanel direction="horizontal" :start-percent="25">
         <template #start>
            <CommitRecordsPanel :id="props.id" @select="handleSelectRecord" />
         </template>
         <template #end>
            <CommitDetailPanel :record-id="selectedRecordId" />
         </template>
      </StSplitPanel>
   </StSpace>
</template>
