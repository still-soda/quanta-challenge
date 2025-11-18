<script setup lang="ts">
import DEFAULT_SPACE_URL from '~/assets/images/default-space-banner.png';
import DEFAULT_AVATAR_URL from '@/assets/images/default-avatar.png';
import {
   BirthdayCake,
   Mail,
   PeopleBottomCard,
   School,
   Config,
} from '@icon-park/vue-next';
import SubmissionStatusCard from '../dashboard/_modules/SubmissionStatusCard.vue';
import AchievementsCard from '../dashboard/_modules/AchievementsCard.vue';
import UserInfoEditDrawer from './_drawers/UserInfoEditDrawer.vue';
import SpaceConfigDrawer from './_drawers/SpaceConfigDrawer.vue';
import dayjs from 'dayjs';
import useAuthStore from '~/stores/auth-store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { $trpc } = useNuxtApp();

// 获取路由参数中的 id（实际是 name）
const userName = computed(() => route.params.id as string);

// 判断是否是查看自己的空间
const isOwnSpace = computed(() => userName.value === authStore.user?.name);

useSeoMeta({ title: `${userName.value}的个人空间 - Quanta Challenge` });

const editDrawerOpened = ref(false);
const configDialogOpened = ref(false);

const openEditDrawer = () => {
   editDrawerOpened.value = true;
};

const openConfigDialog = () => {
   configDialogOpened.value = true;
};

const infoLabelMapping = {
   birthday: '生日',
   email: '邮箱',
   identifier: '身份',
   major: '学院',
};

const iconMapping = {
   birthday: BirthdayCake,
   email: Mail,
   identifier: PeopleBottomCard,
   major: School,
} as const;

type IconKey = keyof typeof iconMapping;

// 获取目标用户的信息
const { data: targetUser, refresh: refreshTargetUser } = await useAsyncData(
   `get-user-by-name-${userName.value}`,
   () => $trpc.protected.user.getUserByName.query({ name: userName.value }),
   {
      watch: [userName],
   }
);

// 获取用户的空间配置
const { data: spaceConfig, refresh: refreshSpaceConfig } = await useAsyncData(
   `get-user-space-config-${userName.value}`,
   () =>
      $trpc.protected.user.getUserSpaceConfig.query({ name: userName.value }),
   {
      watch: [userName],
   }
);

// 辅助函数：安全获取可见性配置
const getVisibility = (field: string): boolean => {
   try {
      if (!spaceConfig.value) return true;
      const config: any = spaceConfig.value;
      const vis = config.personalInfoVisibility;
      if (vis && typeof vis === 'object' && field in vis) {
         return vis[field] === true;
      }
      return true;
   } catch {
      return true;
   }
};

// 转换用户信息为展示格式
const userInfo = computed(() => {
   if (!targetUser.value?.UserInfo) return [];

   const info = targetUser.value.UserInfo;

   const allInfo = [
      {
         label: infoLabelMapping.birthday,
         value: info.birthday
            ? dayjs(info.birthday).format('YYYY-MM-DD')
            : '--',
         iconKey: 'birthday' as IconKey,
         visible: getVisibility('birthday'),
      },
      {
         label: infoLabelMapping.email,
         value: info.email || '--',
         iconKey: 'email' as IconKey,
         visible: getVisibility('email'),
      },
      {
         label: infoLabelMapping.identifier,
         value: info.identifier || '--',
         iconKey: 'identifier' as IconKey,
         visible: getVisibility('identifier'),
      },
      {
         label: infoLabelMapping.major,
         value: info.major || '--',
         iconKey: 'major' as IconKey,
         visible: getVisibility('major'),
      },
   ];

   // 如果是自己的空间，显示所有信息；否则只显示配置为可见的信息
   return isOwnSpace.value ? allInfo : allInfo.filter((item) => item.visible);
});

// 为了兼容编辑功能，保留获取自己信息的接口（仅在查看自己空间时调用）
const { data: rawUserInfo, refresh: refreshRawUserInfo } = await useAsyncData(
   'get-raw-user-info',
   () =>
      isOwnSpace.value
         ? $trpc.protected.user.getUserInfo.query()
         : Promise.resolve(null),
   {
      watch: [isOwnSpace],
   }
);

const handleUserInfoUpdated = async () => {
   await refreshTargetUser();
   await refreshRawUserInfo();
};

const handleSpaceConfigUpdated = async () => {
   await refreshSpaceConfig();
};

const width = ref(38.625);
</script>

<template>
   <StSpace fill justify="center" class="overflow-auto">
      <StSpace
         direction="vertical"
         gap="0.75rem"
         :style="{ width: `${width}rem` }"
         class="p-[0.5rem] mt-[2rem] bg-accent-600 rounded-[1rem] relative border border-secondary/50">
         <StSpace fill-x direction="vertical">
            <StImage
               :src="targetUser?.bannerImageUrl || DEFAULT_SPACE_URL"
               height="13rem"
               :width="`${width - 1.1}rem`"
               class="rounded-[0.875rem] object-top absolute"
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
                     :src="targetUser?.avatarUrl || DEFAULT_AVATAR_URL"
                     width="8.5rem"
                     height="8.5rem"
                     class="!rounded-full z-50"
                     object="cover" />
               </StSpace>
               <StSpace
                  class="px-3 py-2 pr-0"
                  fill-x
                  justify="between"
                  align="center">
                  <StSpace direction="vertical" gap="0.5rem">
                     <div class="st-font-third-bold text-shadow-sm">
                        {{ targetUser?.displayName ?? targetUser?.name }}
                     </div>
                     <div class="st-font-body-normal text-accent-200">
                        20th 前端工程师
                     </div>
                  </StSpace>
                  <StSpace v-if="isOwnSpace" gap="0.5rem">
                     <StButton
                        bordered
                        @click="openEditDrawer"
                        class="!bg-transparent !border-primary !text-primary !font-normal !py-2">
                        编辑个人资料
                     </StButton>
                     <StButton
                        bordered
                        @click="openConfigDialog"
                        class="!bg-transparent !border-primary !text-primary !font-normal !p-2.5">
                        <Config :size="20" :strokeWidth="3" />
                     </StButton>
                  </StSpace>
               </StSpace>
            </StSpace>
         </StSpace>

         <StSpace class="p-4">
            <div class="st-font-body-normal">
               {{ targetUser?.UserInfo?.bio || '这个人没有任何个性签名。' }}
            </div>
         </StSpace>

         <div v-if="userInfo.length > 0" class="h-[1px] w-full bg-accent-500" />

         <StGrid
            v-if="userInfo.length > 0"
            :cols="2"
            fill-x
            class="p-4 !gap-x-0">
            <StSpace
               v-for="(item, idx) in userInfo"
               :key="idx"
               align="center"
               gap="6px"
               class="st-font-body-normal">
               <component
                  :is="iconMapping[item.iconKey]"
                  class="text-accent-200"
                  :strokeWidth="3"
                  :size="20" />
               <span class="text-accent-200">{{ item.label }}：</span>
               <span>{{ item.value }}</span>
            </StSpace>
         </StGrid>

         <div
            v-if="isOwnSpace || spaceConfig?.showSubmissionStatus"
            class="h-[1px] w-full bg-accent-500" />

         <SubmissionStatusCard
            v-if="isOwnSpace || spaceConfig?.showSubmissionStatus"
            status="personal-space"
            class="!mt-0 min-h-[18.625rem]" />

         <div
            v-if="isOwnSpace || spaceConfig?.showAchievements"
            class="h-[1px] w-full bg-accent-500" />

         <AchievementsCard
            v-if="isOwnSpace || spaceConfig?.showAchievements"
            status="personal-space"
            class="!min-h-[16rem]" />
      </StSpace>

      <!-- 编辑用户信息 Drawer -->
      <UserInfoEditDrawer
         v-model:opened="editDrawerOpened"
         @updated="handleUserInfoUpdated" />

      <!-- 空间配置 Drawer -->
      <SpaceConfigDrawer
         v-model:opened="configDialogOpened"
         @updated="handleSpaceConfigUpdated" />
   </StSpace>
</template>
