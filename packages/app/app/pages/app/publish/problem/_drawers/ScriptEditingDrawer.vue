<script setup lang="ts">
import { BookOne, SaveOne } from '@icon-park/vue-next';
import { useSimpleEditor } from '~/composables/use-simple-editor';

const script = defineModel<string>('script');
const opened = defineModel<boolean>('opened', { default: false });

const defaultScript = `export default defineTestHandler(async ({ $, page }) => {
   // 在这里编写测试逻辑
   // 使用 $.defineCheckPoint(name, score, action) 定义检查点
   // 使用 page 对象来操作页面元素
   // 返回分数
})`;

const { containerKey, onEditorContentChanged } = useSimpleEditor({
   script: script.value || defaultScript,
   imports: ['/system.standalone.dts'],
});
onEditorContentChanged((value) => {
   script.value = value;
});
</script>

<template>
   <StDrawer global v-model:opened="opened" width="45rem">
      <StSpace direction="vertical" gap="1rem" class="text-white h-full">
         <StSpace direction="vertical" gap="1.5rem" class="p-6 w-full h-full">
            <!-- Header -->
            <StSpace justify="between" align="end" class="w-full">
               <h1 class="st-font-secondary-bold">编辑判题脚本</h1>
               <StButton
                  class="py-[0.375rem] px-[0.75rem] text-accent-100 !bg-accent-600">
                  <div class="flex gap-2 items-center">
                     <BookOne class="text-[1.25rem]" />
                     <span class="font-light">查看文档</span>
                  </div>
               </StButton>
            </StSpace>
            <main
               :ref="containerKey"
               class="flex flex-1 size-full bg-simple-editor-background"></main>
         </StSpace>
         <!-- Bottom -->
         <StSpace justify="end" class="p-4 w-full">
            <StButton
               @click="opened = false"
               class="py-[0.375rem] px-[1.25rem] text-accent-100 !rounded-[0.375rem]">
               <div class="flex gap-2 items-center">
                  <SaveOne class="text-[1.5rem]" />
                  <span>保存</span>
               </div>
            </StButton>
         </StSpace>
      </StSpace>
   </StDrawer>
</template>
