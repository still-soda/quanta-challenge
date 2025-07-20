<script setup lang="ts">
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
</script>

<template>
   <StCard
      ref="card"
      icon="Fire"
      title="提交情况"
      class="w-full !h-fit mt-4 relative overflow-clip">
      <div
         class="mt-4 overflow-x-auto flex shrink-0 w-0 hide-scrollbar"
         :style="{ width: `${width - 34}px` }">
         <StHeatMap
            loading
            :current-year="2025"
            :rows="9"
            :data="[]"
            class="mr-4" />
      </div>
      <div
         class="absolute right-4 top-0 h-full w-4 bg-gradient-to-l from-accent-600 via-accent-600/70 to-transparent"></div>
   </StCard>
</template>

<style scoped src="./style.css" />
