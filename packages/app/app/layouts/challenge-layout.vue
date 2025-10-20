<script setup lang="ts">
import {
   AlignTextLeftOne,
   History,
   LayoutFour,
   Return,
   SettingOne,
   Timer,
   UploadWeb,
} from '@icon-park/vue-next';
import { useEventEmitter } from '~/composables/use-event-emitter';
import { useParam } from '~/composables/use-param';
import { usePreventLeave } from '~/composables/use-prevent-leave';

const store = useEditorStore();
const toggleDetailWindow = () => {
   store.detailWindowOpened = !store.detailWindowOpened;
};

usePreventLeave();

const { emit: emitCommitEvent } = useEventEmitter('challenge-layout', 'commit');

const path = useParam<string[]>('path', { required: true });
const id = computed(() => Number(path.value?.[1] ?? 0));
const navigateToCommitRecords = () => {
   navigateTo(`/challenge/record/${id.value}`);
};

const route = useRoute();
const mode = computed<'problem' | 'record'>(() => {
   if (route.path.startsWith('/challenge/record')) return 'record';
   return 'problem';
});
</script>

<template>
   <StSpace direction="vertical" fill gap="0" class="h-screen">
      <StHeader>
         <template #left>
            <StSpace gap="0.75rem" align="center">
               <IconLogo class="mx-4" />

               <template v-if="mode === 'record'">
                  <NuxtLink :to="`/challenge/editor/${id}`">
                     <StHeaderButton class="!px-4" text="返回题目">
                        <Return class="text-[1.25rem]" />
                     </StHeaderButton>
                  </NuxtLink>
               </template>

               <template v-if="mode === 'problem'">
                  <a href="/app/problems">
                     <StHeaderButton class="!px-4">
                        <Return class="text-[1.25rem]" />
                     </StHeaderButton>
                  </a>
                  <NuxtLink :to="`/challenge/record/${id}`">
                     <StHeaderButton
                        text="提交记录"
                        @click="navigateToCommitRecords">
                        <History class="text-[1.25rem]" />
                     </StHeaderButton>
                  </NuxtLink>
                  <StHeaderButton
                     @click="toggleDetailWindow"
                     text="题目"
                     class="!text-primary">
                     <AlignTextLeftOne class="text-[1.25rem]" />
                  </StHeaderButton>
               </template>
            </StSpace>
         </template>
         <template #right>
            <StSpace gap="0.75rem" align="center">
               <template v-if="mode === 'problem'">
                  <StHeaderButton
                     @click="emitCommitEvent"
                     :disabled="!store.hasProjectInitialized"
                     text="提交"
                     class="!text-success">
                     <UploadWeb class="text-[1.25rem]" />
                  </StHeaderButton>
                  <StHeaderButton class="!px-4 !text-warning">
                     <Timer class="text-[1.25rem]" />
                  </StHeaderButton>
                  <StHeaderButton class="!px-4">
                     <LayoutFour class="text-[1.25rem]" />
                  </StHeaderButton>
               </template>
               <StHeaderButton class="!px-4">
                  <SettingOne class="text-[1.25rem]" />
               </StHeaderButton>
               <StAvatar class="w-10 h-10" />
            </StSpace>
         </template>
      </StHeader>
      <slot></slot>
   </StSpace>
</template>
