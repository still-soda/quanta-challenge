<script setup lang="ts">
import type { IDateIndicatorProps } from './type';

const recent7days = computed(() => {
   const today = new Date();
   const days = new Array<IDateIndicatorProps>();
   for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
         dateText: date
            .toLocaleDateString('en-US', { weekday: 'short' })
            .toUpperCase(),
         dateNumber: date.getDate(),
         triggered: i === 0,
         checked: i === -1,
      });
   }
   return days;
});
</script>

<template>
   <div class="flex items-center">
      <StIcon
         name="Left"
         class="text-accent-400 hover:cursor-pointer hover:text-accent-300 transition-colors" />
      <div class="flex flex-1 items-center justify-between">
         <StDateIndicatorItem
            v-for="(day, index) in recent7days"
            :key="index"
            :date-text="day.dateText"
            :date-number="day.dateNumber"
            :triggered="day.triggered"
            :checked="day.checked" />
      </div>
      <StIcon
         name="Right"
         class="text-accent-400 hover:cursor-pointer hover:text-accent-300 transition-colors" />
   </div>
</template>
