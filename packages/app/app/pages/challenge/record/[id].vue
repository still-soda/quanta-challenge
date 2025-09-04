<script setup lang="ts">
import { useParam } from '~/composables/utils/use-param';
import CommitRecordsPanel from './components/CommitRecordsPanel.vue';
import CommitDetailPanel from './components/CommitDetailPanel.vue';
import type { CommitRecordType } from './components/shared-types';

definePageMeta({
   layout: 'challenge-layout',
});

const selectedRecordId = ref<number | null>(null);
const handleSelectRecord = (record: CommitRecordType) => {
   selectedRecordId.value = record.id;
};
</script>

<template>
   <StSpace fill center class="p-4 pt-0">
      <StSplitPanel direction="horizontal" :start-percent="25">
         <template #start>
            <CommitRecordsPanel @select="handleSelectRecord" />
         </template>
         <template #end>
            <CommitDetailPanel :record-id="selectedRecordId" />
         </template>
      </StSplitPanel>
   </StSpace>
</template>
