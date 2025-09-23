<script setup lang="ts">
import {
   FullScreenTwo,
   OffScreenTwo,
   Refresh,
   WholeSiteAccelerator,
} from '@icon-park/vue-next';
import { useViewTransition } from '~/composables/use-view-transition';

const props = defineProps<{
   hostName?: string;
   previewUrl?: string;
}>();

const displayUrl = computed(() => {
   if (props.hostName) {
      const regex = new RegExp('^https://(.*\.io)');
      return props.previewUrl?.replace(regex, `http://${props.hostName}`);
   }
   return props.previewUrl;
});

const fullScreenMode = ref(false);
const { startViewTransition } = useViewTransition({ delay: 150 });
const enterFullScreenMode = () => {
   startViewTransition(() => {
      fullScreenMode.value = true;
   });
};
const leaveFullScreenMode = () => {
   startViewTransition(() => {
      fullScreenMode.value = false;
   });
};

const refreshKey = ref(0);
const previewUrl = computed(() => {
   return props.previewUrl ? `${props.previewUrl}?v=${refreshKey.value}` : '';
});
const refresh = () => {
   refreshKey.value++;
};
</script>

<template>
   <StSpace fill direction="vertical" gap="0" class="bg-[#1F1F1F] rounded-xl">
      <StSpace
         fill-x
         class="p-1 rounded-t-xl bg-accent-600"
         justify="between"
         align="center"
         gap="0.25rem">
         <StSpace
            fill-x
            align="center"
            gap="0.5rem"
            class="h-[2rem] relative bg-accent-500 m-0.5 rounded-[0.5rem] px-3 text-accent-100">
            <WholeSiteAccelerator v-show="displayUrl" />
            <StSpace
               fill
               align="center"
               class="relative overflow-auto mini-scrollbar text-xs">
               <div
                  class="absolute left-0 w-full overflow-ellipsis text-nowrap whitespace-nowrap flex shrink-0">
                  {{ displayUrl }}
               </div>
            </StSpace>
         </StSpace>
         <StSpace
            @click="enterFullScreenMode"
            center
            no-shrink
            class="size-[2rem] rounded-[0.5rem] m-0.5 text-accent-200 bg-accent-500 cursor-pointer">
            <FullScreenTwo />
         </StSpace>
         <StSpace
            @click="refresh"
            center
            no-shrink
            class="size-[2rem] rounded-[0.5rem] m-0.5 text-accent-500 bg-secondary cursor-pointer">
            <Refresh />
         </StSpace>
      </StSpace>
      <StSpace
         fill
         class="rounded-b-xl overflow-hidden border border-t-0 border-accent-600">
         <Teleport :disabled="!fullScreenMode" to="body">
            <div
               ref="previewContainer"
               style="view-transition-name: previewContainer"
               :class="{
                  'size-full ': !fullScreenMode,
                  'absolute w-[calc(100vw-4rem)] h-[calc(100vh-4rem)] left-8 top-8 rounded-xl overflow-hidden z-[10000] border border-accent-500 bg-[#1F1F1F]':
                     fullScreenMode,
               }">
               <StSpace
                  v-if="fullScreenMode"
                  @click="leaveFullScreenMode"
                  center
                  no-shrink
                  class="size-[3rem] rounded-full bg-accent-600 text-accent-200 opacity-50 absolute hover:opacity-80 transition-opacity cursor-pointer right-4 top-4 z-[10001]">
                  <OffScreenTwo />
               </StSpace>
               <iframe :src="previewUrl" class="size-full"></iframe>
            </div>
         </Teleport>
      </StSpace>
   </StSpace>
</template>

<style lang="css" src="@/assets/css/utils.css" />
