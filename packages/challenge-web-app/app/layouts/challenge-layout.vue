<script setup lang="ts">
import {
   AlignTextLeftOne,
   History,
   LayoutFour,
   Return,
   SettingOne,
   UploadWeb,
} from '@icon-park/vue-next';
import { useEventEmitter } from '~/composables/use-event-emitter';
import { useParam } from '~/composables/use-param';
import useAuthStore from '~/stores/auth-store';

const store = useEditorStore();
const toggleDetailWindow = () => {
   store.detailWindowOpened = !store.detailWindowOpened;
};

const { emit: emitCommitEvent } = useEventEmitter('challenge-layout', 'commit');

const path = useParam<string[]>('path', { required: true });
const id = computed(() => Number(path.value?.[1] ?? 0));

const route = useRoute();
const mode = computed<'problem' | 'record'>(() => {
   if (route.path.startsWith('/challenge/record')) return 'record';
   return 'problem';
});

const authStore = useAuthStore();
const { $trpc } = useNuxtApp();
await authStore.fetchUserInfo($trpc);

const avatarUrl = computed(() =>
   authStore.user?.imageId ? `/api/static/${authStore.user.imageId}.jpg` : '',
);
</script>

<template>
   <StMessageProvider>
      <div class="flex h-screen w-full bg-[#111111] p-3 gap-3">
         <StMiniSidebar>
            <StMiniSidebarDivider />

            <!-- 导航按钮组 -->
            <StSpace direction="vertical" align="center" gap="0.5rem">
               <template v-if="mode === 'record'">
                  <StSidebarSidePopper content="返回题目">
                     <NuxtLink :to="`/challenge/editor/${id}`">
                        <StRippleEffect>
                           <button
                              class="size-[2.75rem] flex items-center justify-center rounded-full bg-accent-600 text-white hover:bg-accent-500 transition-colors cursor-pointer">
                              <Return class="text-[1.1rem]" />
                           </button>
                        </StRippleEffect>
                     </NuxtLink>
                  </StSidebarSidePopper>
               </template>

               <template v-if="mode === 'problem'">
                  <StSidebarSidePopper content="题目">
                     <StRippleEffect>
                        <button
                           @click="toggleDetailWindow"
                           class="size-[2.75rem] flex items-center justify-center rounded-full bg-accent-600 text-white hover:bg-accent-500 transition-colors cursor-pointer"
                           :class="{
                              '!text-primary': store.detailWindowOpened,
                           }">
                           <AlignTextLeftOne class="text-[1.1rem]" />
                        </button>
                     </StRippleEffect>
                  </StSidebarSidePopper>

                  <StSidebarSidePopper content="提交记录">
                     <NuxtLink :to="`/challenge/record/${id}`">
                        <StRippleEffect>
                           <button
                              class="size-[2.75rem] flex items-center justify-center rounded-full bg-accent-600 text-white hover:bg-accent-500 transition-colors cursor-pointer">
                              <History class="text-[1.1rem]" />
                           </button>
                        </StRippleEffect>
                     </NuxtLink>
                  </StSidebarSidePopper>
               </template>
            </StSpace>

            <!-- 操作按钮组 -->
            <template v-if="mode === 'problem'">
               <StMiniSidebarDivider />

               <StSpace direction="vertical" align="center" gap="0.5rem">
                  <StMiniSidebarButton
                     @click="emitCommitEvent"
                     :disabled="!store.hasProjectInitialized"
                     name="提交"
                     class="size-[2.75rem] flex items-center justify-center rounded-full bg-accent-600 hover:bg-accent-500 transition-colors cursor-pointer !text-success"
                     :class="{
                        '!opacity-40 !cursor-not-allowed !text-accent-300':
                           !store.hasProjectInitialized,
                     }">
                     <UploadWeb class="text-[1.1rem]" />
                  </StMiniSidebarButton>

                  <TimerWidget :toolbar="true" />

                  <StMiniSidebarButton name="布局">
                     <LayoutFour class="text-[1.1rem]" />
                  </StMiniSidebarButton>
               </StSpace>
            </template>

            <!-- 弹性空间 -->
            <div class="flex-1" />

            <!-- 底部按钮 -->
            <StSpace
               direction="vertical"
               align="center"
               gap="0.5rem"
               class="mb-1">
               <StSidebarSidePopper content="设置">
                  <StRippleEffect>
                     <button
                        class="size-[2.75rem] flex items-center justify-center rounded-full bg-accent-600 text-white hover:bg-accent-500 transition-colors cursor-pointer">
                        <SettingOne class="text-[1.1rem]" />
                     </button>
                  </StRippleEffect>
               </StSidebarSidePopper>

               <StAvatar size="2.25rem" :url="avatarUrl" />
            </StSpace>
         </StMiniSidebar>

         <!-- 主内容区 -->
         <div class="flex-1 h-full overflow-hidden">
            <slot></slot>
         </div>

         <!-- 对话框覆盖层 -->
         <DialogOverlay />
      </div>
   </StMessageProvider>
</template>
