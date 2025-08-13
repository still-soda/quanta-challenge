<script setup lang="ts">
defineProps<{
   previewUrl?: string;
}>();
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
            class="h-[2rem] relative bg-accent-500 m-0.5 rounded-[0.5rem] px-3 text-accent-100 text-xs">
            <StIcon name="WholeSiteAccelerator" />
            <StSpace
               fill
               align="center"
               class="relative overflow-auto mini-scrollbar">
               <div
                  class="absolute left-0 w-full overflow-ellipsis flex shrink-0">
                  {{ previewUrl }}
               </div>
            </StSpace>
         </StSpace>
         <StSpace
            center
            no-shrink
            class="size-[2rem] rounded-[0.5rem] m-0.5 text-accent-200 bg-accent-500">
            <StIcon name="FullScreenTwo" />
         </StSpace>
         <StSpace
            center
            no-shrink
            class="size-[2rem] rounded-[0.5rem] m-0.5 text-accent-500 bg-secondary">
            <StIcon name="Refresh" />
         </StSpace>
      </StSpace>
      <StSpace
         fill
         class="rounded-b-xl overflow-hidden border border-t-0 border-accent-600">
         <iframe :src="previewUrl" class="w-full h-full"></iframe>
      </StSpace>
   </StSpace>
</template>

<style lang="css" src="@/assets/css/utils.css" />
