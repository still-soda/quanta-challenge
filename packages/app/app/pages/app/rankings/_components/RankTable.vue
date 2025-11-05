<script setup lang="ts">
import { Lock } from '@icon-park/vue-next';
import type { IRanking } from '../_types';
import RankTableSkeleton from '../_skeletons/rank-table-skeleton.vue';

useSeoMeta({
   title: '排行榜 - Quanta Challenge',
   description: '查看用户排行榜，了解排名和成绩。',
});

defineProps<{
   data: IRanking[];
   loading: boolean;
}>();
</script>

<template>
   <StSpace class="w-[48rem]">
      <table class="!border-separate border-spacing-0 w-full table-fixed">
         <colgroup>
            <col style="width: 6rem" />
            <col style="width: auto" />
            <col style="width: 6rem" />
            <col style="width: 6rem" />
            <col style="width: 6rem" />
         </colgroup>

         <thead class="sticky top-[5.75rem]">
            <tr class="text-accent-700 text-nowrap whitespace-nowrap text-left">
               <th
                  class="bg-secondary pl-6 pr-3 py-[0.625rem] rounded-l-lg z-[10000]">
                  排名
               </th>
               <th class="bg-secondary pr-3 py-[0.625rem]">用户</th>
               <th class="bg-secondary pr-3 py-[0.625rem]">分数</th>
               <th class="bg-secondary pr-3 py-[0.625rem]">正确率</th>
               <th class="bg-secondary pr-6 py-[0.625rem] rounded-r-lg">
                  提交次数
               </th>
            </tr>
         </thead>
         <tbody v-if="loading">
            <RankTableSkeleton />
         </tbody>
         <tbody v-else>
            <template v-if="data.length > 0">
               <tr
                  v-for="item in data"
                  :key="item.userId"
                  class="text-left even:bg-accent-600">
                  <td
                     class="pl-6 pr-3 py-4 text-white rounded-l-lg text-center">
                     <div
                        class="flex items-center justify-center font-bold size-[2.25rem] rounded-full text-sm font-family-manrope"
                        :class="{
                           'bg-[#FFBE31] text-accent-700': item.rank === 1,
                           'bg-[#CACACA] text-accent-700': item.rank === 2,
                           'bg-[#9E5C38] text-white': item.rank === 3,
                           'bg-accent-500 text-white': item.rank > 3,
                        }">
                        {{ item.rank }}
                     </div>
                  </td>
                  <td class="pr-3 py-4 flex items-center gap-3">
                     <StImage
                        lazy
                        :src="item.imageUrl"
                        alt="avatar"
                        width="2.25rem"
                        height="2.25rem"
                        object="cover"
                        class="rounded-lg" />
                     <span class="st-font-body-bold text-white">
                        {{ item.userName }}
                     </span>
                  </td>
                  <td
                     class="pr-3 py-4 text-white text-left font-family-manrope font-bold">
                     {{ item.score }}
                  </td>
                  <td class="pr-3 py-4 text-white font-family-manrope">
                     {{ item.correctRate.toFixed(2) }}%
                  </td>
                  <td
                     class="pr-6 py-4 text-white rounded-r-lg font-family-manrope text-center">
                     {{ item.submissions }}
                  </td>
               </tr>
            </template>

            <template v-else>
               <tr>
                  <td colspan="5">
                     <StSpace
                        fill
                        direction="vertical"
                        gap="0.75rem"
                        align="center"
                        justify="center"
                        class="text-accent-400 my-[20vh]">
                        <Lock size="2.625rem" />
                        <div class="st-font-body-normal">排名未解锁</div>
                     </StSpace>
                  </td>
               </tr>
            </template>
         </tbody>
      </table>
   </StSpace>
</template>
