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
import { useEventEmitter } from '~/composables/utils/use-event-emitter';
import { usePreventLeave } from '~/composables/utils/use-prevent-leave';

const store = useEditorStore();
const toggleDetailWindow = () => {
   store.detailWindowOpened = !store.detailWindowOpened;
};

usePreventLeave();

const { emit: emitCommitEvent } = useEventEmitter('challenge-layout', 'commit');
</script>

<template>
   <StSpace direction="vertical" fill gap="0">
      <StHeader>
         <template #left>
            <StSpace gap="0.75rem" align="center">
               <IconLogo class="mx-4" />
               <a href="/app/problems">
                  <StHeaderButton class="!px-4">
                     <Return class="text-[1.25rem]" />
                  </StHeaderButton>
               </a>
               <StHeaderButton text="提交记录">
                  <History class="text-[1.25rem]" />
               </StHeaderButton>
               <StHeaderButton
                  @click="toggleDetailWindow"
                  text="题目"
                  class="!text-primary">
                  <AlignTextLeftOne class="text-[1.25rem]" />
               </StHeaderButton>
            </StSpace>
         </template>
         <template #right>
            <StSpace gap="0.75rem" align="center">
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
