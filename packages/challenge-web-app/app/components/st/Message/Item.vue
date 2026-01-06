<script setup lang="ts">
import type { DefineComponent } from 'vue';
import type { MessageType } from './type';
import {
   Attention,
   CheckOne,
   CloseOne,
   Info,
   LoadingFour,
} from '@icon-park/vue-next';

defineProps<{
   type: MessageType;
   title: string;
   content?: string | DefineComponent;
   closeText?: string;
   closable?: boolean;
   minWidth?: string | number;
   loading?: boolean;
}>();

const typeToIcon: Record<MessageType, DefineComponent> = {
   info: Info,
   success: CheckOne,
   error: CloseOne,
   warning: Attention,
};

defineEmits<{
   (e: 'close'): void;
}>();
</script>

<template>
   <div
      class="p-4 rounded-xl border border-accent-500 w-fit bg-accent-600 text-white flex items-center gap-8">
      <div class="flex flex-col gap-2">
         <div class="flex items-center gap-2">
            <LoadingFour v-if="loading" class="text-primary animate-spin" />
            <component
               v-else
               :is="typeToIcon[type]"
               size="1rem"
               :fill="
                  type === 'info'
                     ? '#3B82F6'
                     : type === 'success'
                     ? '#10B981'
                     : type === 'error'
                     ? '#EF4444'
                     : '#F59E0B'
               "
               :strokeWidth="3" />
            <div class="st-font-body-bold !text-sm">{{ title }}</div>
         </div>
         <slot>
            <div
               v-if="content"
               class="st-font-caption text-accent-300 max-w-72">
               {{ content }}
            </div>
         </slot>
      </div>
      <div v-if="closable" class="ml-auto">
         <StButton
            :disabled="loading"
            @click="$emit('close')"
            theme="secondary"
            class="!py-1 !px-3 !text-xs font-normal !rounded-sm !text-accent-500">
            {{ closeText || '知道了' }}
         </StButton>
      </div>
   </div>
</template>
