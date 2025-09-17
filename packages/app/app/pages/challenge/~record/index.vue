<script setup lang="ts">
import CommitRecordsPanel from './components/CommitRecordsPanel.vue';
import CommitDetailPanel from './components/CommitDetailPanel.vue';
import type { CommitRecordType } from './components/shared-types';

const props = defineProps<{ id: number }>();

definePageMeta({
   layout: 'challenge-layout',
});

const selectedRecordId = ref<number | null>(null);
const handleSelectRecord = (record: CommitRecordType) => {
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
