<script setup lang="ts">
import { ref, computed } from 'vue';
import NotificationItem from './_components/NotificationItem.vue';
import NotificationDetailModal from './_components/NotificationDetailModal.vue';
import NotificationItemSkeleton from './_components/NotificationItemSkeleton.vue';
import { DoneAll, Inbox } from '@icon-park/vue-next';
import { useNuxtApp } from '#app';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~~/server/trpc/routes';

useSeoMeta({ title: '通知中心 - Quanta Challenge' });

type RouterOutput = inferRouterOutputs<AppRouter>;
type Notification =
   RouterOutput['protected']['notification']['list']['items'][number];

const { $trpc } = useNuxtApp();

const filterType = ref<
   'ALL' | 'UNREAD' | 'SYSTEM' | 'JUDGE' | 'COMMENT' | 'LIKE' | 'ACHIEVEMENT'
>('ALL');

// 使用 useAsyncData 确保 SSR 支持
const {
   data: notificationsData,
   pending: loading,
   refresh: refreshNotifications,
} = await useAsyncData(
   'notifications',
   async () => {
      const promise = $trpc.protected.notification.list.query({
         type: filterType.value,
         cursor: null,
         limit: 20,
      });
      const result = await (typeof window === 'undefined'
         ? promise
         : atLeastTime(500, promise));
      return result;
   },
   {
      watch: [filterType],
      server: true,
   }
);

const notifications = ref<Notification[]>(notificationsData.value?.items || []);
const allLoaded = ref(false);

// 监听 notificationsData 变化,更新 notifications
watch(
   notificationsData,
   (newData) => {
      if (newData) {
         notifications.value = newData.items;
         allLoaded.value = !newData.nextCursor;
      }
   },
   { immediate: true }
);

const filterOptions = [
   { label: '全部', value: 'ALL', color: '#FA7C0E' },
   { label: '未读', value: 'UNREAD', color: '#F59E0B' },
   { label: '系统', value: 'SYSTEM', color: '#3B82F6' },
   { label: '判题', value: 'JUDGE', color: '#10B981' },
];

const markAllAsRead = async () => {
   try {
      await $trpc.protected.notification.markAllAsRead.mutate();
      notifications.value.forEach((n: Notification) => (n.read = true));
   } catch (error) {
      console.error('Failed to mark all as read:', error);
   }
};

const selectedNotification = ref<Notification | null>(null);
const isModalOpened = ref(false);

const openNotification = async (notification: Notification) => {
   selectedNotification.value = notification;
   isModalOpened.value = true;

   if (!notification.read) {
      try {
         await $trpc.protected.notification.markAsRead.mutate({
            id: notification.id,
         });
         notification.read = true;
      } catch (error) {
         console.error('Failed to mark as read:', error);
      }
   }
};

const currentIndex = computed(() => {
   if (!selectedNotification.value) return -1;
   return notifications.value.findIndex(
      (n: Notification) => n.id === selectedNotification.value?.id
   );
});

const hasPrevious = computed(() => currentIndex.value > 0);
const hasNext = computed(
   () =>
      currentIndex.value !== -1 &&
      currentIndex.value < notifications.value.length - 1
);

const handlePrev = () => {
   if (hasPrevious.value) {
      const prev = notifications.value[currentIndex.value - 1];
      if (prev) {
         openNotification(prev);
      }
   }
};

const handleNext = () => {
   if (hasNext.value) {
      const next = notifications.value[currentIndex.value + 1];
      if (next) {
         openNotification(next);
      }
   }
};
</script>

<template>
   <StSpace direction="vertical" align="center" gap="0" class="w-full">
      <StSpace
         direction="vertical"
         gap="1.5rem"
         fill
         class="px-4 py-6 max-w-[50rem] w-full shrink-0">
         <div class="flex justify-between items-end w-full">
            <h1 class="st-font-hero-bold">通知中心</h1>
            <div
               @click="markAllAsRead"
               class="flex items-center gap-1.5 text-accent-400 hover:text-accent-100 cursor-pointer transition-colors select-none">
               <DoneAll size="1.125rem" />
               <span class="st-font-body-normal">全部已读</span>
            </div>
         </div>

         <div class="w-full">
            <StSlideRadioGroup
               :options="filterOptions"
               v-model:value="filterType" />
         </div>

         <StSpace direction="vertical" gap="1rem" fill class="w-full">
            <NotificationItem
               v-for="item in notifications"
               :key="item.id"
               :id="item.id"
               :type="item.type"
               :title="item.title"
               :content="item.content"
               :time="item.createdAt.toLocaleString()"
               :read="item.read"
               @click="openNotification(item)" />

            <StEmptyStatus
               v-if="notifications.length === 0 && !loading"
               content="暂无通知"
               :icon="Inbox"
               class="opacity-60 py-20" />
            <template v-if="loading">
               <NotificationItemSkeleton v-for="i in 5" :key="i" />
            </template>
         </StSpace>
      </StSpace>

      <NotificationDetailModal
         v-model:opened="isModalOpened"
         :notification="selectedNotification"
         :has-previous="hasPrevious"
         :has-next="hasNext"
         @prev="handlePrev"
         @next="handleNext" />
   </StSpace>
</template>
