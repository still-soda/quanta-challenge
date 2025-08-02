<script setup lang="ts">
import { monthText, type IHeatMapProps } from './type';

const props = defineProps<IHeatMapProps>();

const rows = computed(() => props.rows ?? 9);
const items = computed(() => {
   const daysPerMonth = (() => {
      const days = [];
      for (let i = 0; i < monthText.length; i++) {
         const monthDays = new Date(
            new Date().getFullYear(),
            i + 1,
            0
         ).getDate();
         days.push(monthDays);
      }
      return days;
   })();
   let offset = 0;
   return daysPerMonth.map((day) => {
      const d = day + offset;
      offset = d % rows.value;
      return d - offset;
   });
});
</script>

<template>
   <table class="w-full">
      <thead>
         <tr class="font-light text-[0.875rem] text-white">
            <td v-for="(month, idx) in monthText" :key="idx">
               <div class="mb-2">{{ month }}</div>
            </td>
         </tr>
      </thead>
      <tbody>
         <tr>
            <td v-for="(days, idx) in items" :key="idx">
               <div
                  class="w-fit grid gap-[0.375rem] mr-[0.375rem] grid-flow-col"
                  :style="{ gridTemplateRows: `repeat(${rows}, 1fr)` }">
                  <StHeatMapItem
                     v-for="idx in days"
                     :key="idx"
                     :loading="loading" />
               </div>
            </td>
         </tr>
      </tbody>
   </table>
</template>
