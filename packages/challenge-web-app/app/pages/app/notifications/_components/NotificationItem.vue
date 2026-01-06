<script setup lang="ts">
import {
   Remind,
   System,
   Comment,
   Like,
   Info,
   CheckOne,
} from '@icon-park/vue-next';
import dayjs from 'dayjs';

import type { NotificationType } from '@prisma/client';

interface NotificationProps {
   id: string;
   type: NotificationType;
   title: string;
   content: string;
   time: string;
   read: boolean;
}

const props = defineProps<NotificationProps>();

const lowerCaseType = computed(
   () =>
      (props.type as string).toLowerCase() as
         | 'system'
         | 'comment'
         | 'like'
         | 'judge'
         | 'achievement'
);

const iconMap = {
   system: System,
   comment: Comment,
   like: Like,
   judge: Info, // Or specific icon for judge
   achievement: CheckOne,
};

const iconColorMap = {
   system: 'text-accent-100',
   comment: 'text-primary',
   like: 'text-red-500',
   judge: 'text-blue-500',
   achievement: 'text-yellow-500',
};

const IconComponent = computed(() => iconMap[lowerCaseType.value] || Remind);
const iconClass = computed(
   () => iconColorMap[lowerCaseType.value] || 'text-accent-100'
);
</script>

<template>
   <div
      class="w-full p-4 rounded-lg border border-accent-600 bg-accent-700/30 hover:bg-accent-700/50 transition-colors cursor-pointer flex gap-4 items-start relative group">
      <div
         class="w-10 h-10 rounded-full bg-accent-600 flex items-center justify-center shrink-0">
         <component :is="IconComponent" class="text-xl" :class="iconClass" />
      </div>
      <div class="flex-1 min-w-0">
         <div class="flex justify-between items-start">
            <h3 class="st-font-bold-body text-accent-100 mb-1">
               {{ title }}
            </h3>
            <span
               class="st-font-caption text-accent-400 whitespace-nowrap ml-2">
               {{ dayjs(time).format('YYYY-MM-DD HH:mm') }}
            </span>
         </div>
         <p class="st-font-body-normal text-accent-300 line-clamp-2">
            {{ content }}
         </p>
      </div>
      <div
         v-if="!read"
         class="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary"></div>
   </div>
</template>
