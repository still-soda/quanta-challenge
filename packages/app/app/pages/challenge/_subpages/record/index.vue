<script setup lang="ts">
import CommitRecordsPanel from './_modules/CommitRecordsPanel.vue';
import CommitDetailPanel from './_modules/CommitDetailPanel.vue';

const props = defineProps<{ id: number }>();
</script>

<template>
   <StSpace fill center class="p-4 pr-6 pt-0">
      <StSplitPanel direction="horizontal" :start-percent="25">
         <template #start>
            <CommitRecordsPanel :id="props.id" />
         </template>
         <template #end>
            <CommitDetailPanel :problem-id="props.id" />
         </template>
      </StSplitPanel>
   </StSpace>
</template>
