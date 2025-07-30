<script setup lang="ts">
import ScriptEditing from './ScriptEditing.vue';

const ready = ref(false);
const isEditing = ref(false);
</script>

<template>
   <StDrawer global :opened="true" width="40rem">
      <ScriptEditing />
   </StDrawer>
   <div
      class="p-[0.375rem] pb-4 border border-accent-300 rounded-lg flex flex-col items-center gap-3">
      <div class="p-4 rounded-[0.25rem] bg-accent-600 w-full">
         <StCodePreview
            v-show="ready"
            @ready="ready = true"
            code="const item = () => <div>Hello World</div>;" />
         <div
            v-show="!ready"
            class="st-font-caption text-accent-200 text-[0.875rem]">
            暂无判题脚本
         </div>
      </div>
      <div
         @click="isEditing = true"
         class="flex gap-2 text-accent-100 font-bold items-center hover:text-primary transition-colors hover:cursor-pointer">
         <StIcon name="Code" class="text-[1.25rem]" />
         点击进入编辑
      </div>
   </div>
</template>
