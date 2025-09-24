<script setup lang="ts">
const props = defineProps<{
   rank: {
      from: number;
      to: number;
      count: number;
   }[];
   currentScore?: number;
}>();

const rank = ref<{ from: number; to: number; count: number }[]>([]);
watch(
   () => props.rank,
   (newVal) => {
      if (newVal.length) {
         if (!rank.value.length) {
            rank.value = newVal.map((item) => ({ ...item, count: 0 }));
         }
         setTimeout(() => {
            rank.value = newVal;
         }, 200);
      }
   },
   { immediate: true }
);

const currentIntervalIdx = computed(() => {
   if (props.currentScore === undefined) return -1;
   return props.rank.findLastIndex(
      (item) =>
         props.currentScore! >= item.from && props.currentScore! <= item.to
   );
});

const maxCount = computed(() => {
   return Math.max(...props.rank.map((item) => item.count));
});

const xAxisLabels = computed(() => {
   const minScore = Math.min(...props.rank.map((item) => item.from));
   const maxScore = Math.max(...props.rank.map((item) => item.to));
   const delta = maxScore - minScore;
   const count = props.rank.length / 2;
   const labels: number[] = [];
   for (let i = 0; i <= count; i++) {
      labels.push(Math.round((delta / count) * i) + minScore);
   }
   const result = Array.from(new Set(labels));
   return result.length === 1 ? result : result.slice(1);
});
</script>

<template>
   <StSpace direction="vertical" fill gap="0.5rem" class="pt-6">
      <StSpace gap=".25rem" fill class="flex-1" align="end">
         <div
            v-for="(item, idx) in rank"
            :style="{ height: `${(item.count / maxCount) * 100 + 5}%` }"
            :key="idx"
            :class="[
               currentIntervalIdx === idx ? 'bg-primary' : 'bg-secondary',
            ]"
            class="w-full rounded-sm transition-all duration-500 ease-out"></div>
      </StSpace>
      <StSpace fill-x gap="0">
         <span
            v-for="(label, idx) in xAxisLabels"
            :key="idx"
            class="text-[0.625rem] text-center w-full font-bold text-accent-300 font-family-manrope">
            {{ label }}
         </span>
      </StSpace>
   </StSpace>
</template>
