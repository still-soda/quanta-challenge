<script setup lang="ts">
import NotificationItem from './_components/NotificationItem.vue';
import NotificationDetailModal from './_components/NotificationDetailModal.vue';
import { DoneAll } from '@icon-park/vue-next';

useSeoMeta({ title: '通知中心 - Quanta Challenge' });

type NotificationType = 'system' | 'comment' | 'like' | 'judge' | 'achievement';

// Mock Data
const notifications = ref<
   {
      id: string;
      type: NotificationType;
      title: string;
      content: string;
      time: string;
      read: boolean;
   }[]
>([
   {
      id: '1',
      type: 'system',
      title: '系统维护通知',
      content:
         '我们将于本周六凌晨 2:00 进行系统维护，预计耗时 2 小时。期间服务将不可用，请提前保存您的工作。',
      time: '2小时前',
      read: false,
   },
   {
      id: '2',
      type: 'judge',
      title: '判题结果通知',
      content:
         '您提交的题目 "两数之和" 判题完成。结果：通过 (Accepted)。得分：100/100。',
      time: '5小时前',
      read: false,
   },
   {
      id: '3',
      type: 'achievement',
      title: '获得新成就',
      content: '恭喜！您已连续打卡 7 天，获得成就 "坚持不懈"。',
      time: '1天前',
      read: true,
   },
   {
      id: '4',
      type: 'comment',
      title: '新评论',
      content: 'User123 回复了您的评论："这个解法真的很巧妙，学习了！"',
      time: '2天前',
      read: true,
   },
   {
      id: '5',
      type: 'like',
      title: '收到点赞',
      content: '您的题解 "动态规划详解" 收到了 10 个新的点赞。',
      time: '3天前',
      read: true,
   },
   {
      id: '6',
      type: 'system',
      title: '欢迎加入 Quanta Challenge',
      content:
         '欢迎来到 Quanta Challenge！这里有丰富的编程挑战等待着您。开始您的编程之旅吧！',
      time: '1周前',
      read: true,
   },
]);

const filterType = ref('all');

const filterOptions = [
   { label: '全部', value: 'all', color: '#FA7C0E' },
   { label: '未读', value: 'unread', color: '#F59E0B' },
   { label: '系统', value: 'system', color: '#3B82F6' },
   { label: '判题', value: 'judge', color: '#10B981' },
];

const filteredNotifications = computed(() => {
   if (filterType.value === 'all') return notifications.value;
   if (filterType.value === 'unread')
      return notifications.value.filter((n) => !n.read);
   return notifications.value.filter((n) => n.type === filterType.value);
});

const markAllAsRead = () => {
   notifications.value.forEach((n) => (n.read = true));
};

const selectedNotification = ref<(typeof notifications.value)[0] | null>(null);
const isModalOpened = ref(false);

const openNotification = (notification: (typeof notifications.value)[0]) => {
   selectedNotification.value = notification;
   isModalOpened.value = true;

   // Mark as read when opened
   if (!notification.read) {
      notification.read = true;
   }
};

const currentIndex = computed(() => {
   if (!selectedNotification.value) return -1;
   return filteredNotifications.value.findIndex(
      (n) => n.id === selectedNotification.value?.id
   );
});

const hasPrevious = computed(() => currentIndex.value > 0);
const hasNext = computed(
   () =>
      currentIndex.value !== -1 &&
      currentIndex.value < filteredNotifications.value.length - 1
);

const handlePrev = () => {
   if (hasPrevious.value) {
      const prev = filteredNotifications.value[currentIndex.value - 1];
      if (prev) {
         openNotification(prev);
      }
   }
};

const handleNext = () => {
   if (hasNext.value) {
      const next = filteredNotifications.value[currentIndex.value + 1];
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
               v-for="item in filteredNotifications"
               :key="item.id"
               v-bind="item"
               @click="openNotification(item)" />

            <div
               v-if="filteredNotifications.length === 0"
               class="py-12 text-center text-accent-400">
               <div class="st-font-body-normal">暂无通知</div>
            </div>
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
