<script setup lang="tsx">
import dayjs from 'dayjs';
import { monthText, type IHeatMapProps } from './type';
import StPopover from '~/components/st/Popover/index.vue';
import { Calendar, UploadOne } from '@icon-park/vue-next';

const props = defineProps<IHeatMapProps>();

const rows = computed(() => props.rows ?? 9);
const months = computed(() => {
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

const getDateId = (month: number, day: number) => {
   const pad = (n: number) => String(n).padStart(2, '0');
   return `${props.currentYear}-${pad(month)}-${pad(day)}`;
};

const getCountByDate = (month: number, day: number) => {
   const pad = (n: number) => String(n).padStart(2, '0');
   const dateStr = `${props.currentYear}-${pad(month)}-${pad(day)}`;
   const count = props.data[dateStr] ?? 0;
   return count;
};

onMounted(() => {
   const currentId = dayjs(new Date()).format('YYYY-MM-DD');
   const el = document.getElementById(currentId);
   el &&
      el.scrollIntoView({
         behavior: 'smooth',
         block: 'center',
         inline: 'center',
      });
});

const PopperContent = (props: {
   month: number;
   day: number;
   triggered: boolean;
}) => {
   const { month, day, triggered } = props;
   const count = getCountByDate(month, day);
   const date = getDateId(month, day);
   return (
      <div
         class={[
            'bg-accent-700 p-2 text-white rounded-md transition-all',
            triggered ? 'translate-0 scale-100' : 'translate-y-2 scale-90',
         ]}>
         <div class='st-font-body-normal mb-1 flex items-center gap-1 text-white/60'>
            <Calendar />
            {date}
         </div>
         <div class='st-font-body-small flex items-center gap-1 text-white/60'>
            <UploadOne />
            <span>
               当日
               <span class='text-primary'> {count} </span>
               次提交
            </span>
         </div>
      </div>
   );
};
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
            <td v-for="(days, month) in months" :key="idx">
               <div
                  class="w-fit grid gap-[0.375rem] mr-[0.375rem] grid-flow-col"
                  :style="{ gridTemplateRows: `repeat(${rows}, 1fr)` }">
                  <Component
                     v-for="day in days"
                     :is="getCountByDate(month + 1, day) ? StPopover : 'div'"
                     placement="top">
                     <template #popper="{ triggered }">
                        <PopperContent
                           :month="month + 1"
                           :day="day"
                           :triggered="triggered" />
                     </template>
                     <StHeatMapItem
                        :id="getDateId(month + 1, day)"
                        :key="day"
                        :count="getCountByDate(month + 1, day)"
                        :loading="loading" />
                  </Component>
               </div>
            </td>
         </tr>
      </tbody>
   </table>
</template>
