<script setup lang="ts">
import { Fire } from '@icon-park/vue-next';

const card = useTemplateRef('card');

const width = ref(0);
onMounted(() => {
   if (!card.value) return;
   width.value = card.value.$el.getBoundingClientRect().width;
   window.addEventListener('resize', () => {
      if (!card.value) return;
      width.value = card.value.$el.getBoundingClientRect().width;
   });
});

const { $trpc } = useNuxtApp();
// const loading = ref(true);
// const submissionStatusData = ref<Record<string, number>>({});
// const getSubmissionStatusData = async () => {
//    loading.value = true;
//    submissionStatusData.value = await autoRetry(() =>
//       $trpc.protected.dashboard.getSubmissionStatus.query()
//    );
//    loading.value = false;
// };

// onMounted(() => {
//    getSubmissionStatusData();
// });
const { data: submissionStatusData, pending: loading } = useAsyncData(
   'submission-status-data',
   () =>
      $trpc.protected.dashboard.getSubmissionStatus.query().then((res) => {
         return res;
      })
);

const scrollContainer = useTemplateRef('scrollContainer');
const showEndMask = ref(false);
onMounted(() => {
   if (!scrollContainer.value) return;
   const el = scrollContainer.value;
   el.addEventListener('scroll', () => {
      showEndMask.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
   });
});
</script>

<template>
   <StCard
      :icon="Fire"
      ref="card"
      title="提交情况"
      class="w-full !h-fit mt-4 relative overflow-clip">
      <div
         ref="scrollContainer"
         class="mt-4 overflow-x-auto flex shrink-0 w-0 hide-scrollbar relative min-w-[36.625rem]"
         :style="{ width: `${width - 34}px` }">
         <StHeatMap
            :loading="loading"
            :current-year="new Date().getFullYear()"
            :rows="9"
            :data="submissionStatusData ?? {}" />
      </div>
      <div
         :class="[showEndMask ? 'opacity-100' : 'opacity-0']"
         class="absolute right-4 bottom-0 h-full w-4 bg-gradient-to-l from-accent-600 via-accent-600/70 to-transparent transition-opacity"></div>
   </StCard>
</template>

<style scoped src="../_styles/index.css" />
