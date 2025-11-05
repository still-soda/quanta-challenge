<script setup lang="ts">
import DEFAULT_SPACE_URL from '~/assets/images/default-space-banner.png';
import DEFAULT_AVATAR_URL from '@/assets/images/default-avatar.png';
import {
   BirthdayCake,
   Mail,
   PeopleBottomCard,
   School,
} from '@icon-park/vue-next';
import SubmissionStatusCard from '../dashboard/_modules/SubmissionStatusCard.vue';
import AchievementsCard from '../dashboard/_modules/AchievementsCard.vue';

useSeoMeta({ title: '个人空间 - Quanta Challenge' });

const userInfo = [
   { label: '生日', value: '2000-01-01', icon: BirthdayCake },
   { label: '邮箱', value: 'example@example.com', icon: Mail },
   { label: '身份', value: '前端工程师', icon: PeopleBottomCard },
   { label: '学院', value: '计算机科学与技术学院', icon: School },
];
</script>

<template>
   <StSpace fill justify="center" class="overflow-auto">
      <StSpace
         direction="vertical"
         gap="0.75rem"
         class="w-[42.625rem] p-[0.875rem] mt-[2rem] bg-accent-600 rounded-[1rem] relative">
         <StSpace fill-x direction="vertical">
            <StImage
               :src="DEFAULT_SPACE_URL"
               height="13rem"
               width="40.875rem"
               class="rounded-[0.5rem] object-top absolute"
               object="cover" />
            <StSpace
               class="px-[1.5rem] pr-[1rem] mt-[10rem] z-5 relative"
               gap="1rem"
               align="end"
               fill-x>
               <StSpace class="relative shrink-0">
                  <div
                     class="size-[9.5rem] rounded-full bg-[#434343] opacity-60 backdrop-blur-xs absolute -left-2 -top-2"></div>
                  <StImage
                     :src="DEFAULT_AVATAR_URL"
                     width="8.5rem"
                     height="8.5rem"
                     class="!rounded-full z-50" />
               </StSpace>
               <StSpace
                  class="px-3 py-2 pr-0"
                  fill-x
                  justify="between"
                  align="center">
                  <StSpace direction="vertical" gap="0.5rem">
                     <div class="st-font-third-bold text-shadow-sm">
                        没有气的汽水
                     </div>
                     <div class="st-font-body-normal text-accent-200">
                        20th 前端工程师
                     </div>
                  </StSpace>
                  <StButton
                     bordered
                     class="!bg-transparent !border-secondary !text-secondary !font-normal !py-2">
                     编辑个人资料
                  </StButton>
               </StSpace>
            </StSpace>
         </StSpace>

         <StSpace class="p-4">
            <div class="st-font-body-normal">这个人没有任何个性签名。</div>
         </StSpace>

         <div class="h-[1px] w-full bg-accent-500" />

         <StGrid :cols="2" fill-x class="p-4 !gap-x-0">
            <StSpace
               v-for="(item, idx) in userInfo"
               :key="idx"
               align="center"
               gap="6px"
               class="st-font-body-normal">
               <component
                  :is="item.icon"
                  class="text-accent-200"
                  :strokeWidth="3"
                  :size="20" />
               <span class="text-accent-200">{{ item.label }}：</span>
               <span>{{ item.value }}</span>
            </StSpace>
         </StGrid>

         <div class="h-[1px] w-full bg-accent-500" />

         <SubmissionStatusCard status="personal-space" class="!mt-0" />

         <div class="h-[1px] w-full bg-accent-500" />

         <AchievementsCard status="personal-space" class="!min-h-[16rem]" />
      </StSpace>
   </StSpace>
</template>
