<script setup lang="ts">
import { useMarkdown } from '~/composables/utils/use-markdown';
import { useSimpleEditor } from '~/composables/utils/use-simple-editor';

const script = defineModel<string>('markdown');
const opened = defineModel<boolean>('opened', { default: false });

const { containerKey, onEditorContentChanged, setEditorContent } =
   useSimpleEditor({
      script: script.value ?? '',
      language: 'markdown',
      options: {
         lineNumbers: 'off',
         wordWrap: 'on',
         wrappingStrategy: 'advanced',
      },
   });
const { html, update } = useMarkdown();
const debounceUpdate = useDebounceFn(update, 200);

onEditorContentChanged((value) => {
   script.value = value;
   debounceUpdate(value);
});

watch(script, (value) => {
   if (value) {
      setEditorContent(value);
      debounceUpdate(value);
   }
});

update(script.value ?? '');
</script>

<template>
   <StDrawer global v-model:opened="opened" width="60rem">
      <StSpace direction="vertical" gap="1rem" class="text-white h-full">
         <StSpace direction="vertical" gap="1.5rem" class="p-6 w-full h-full">
            <!-- Header -->
            <h1 class="st-font-secondary-bold">编辑题目详情</h1>
            <StSplitPanel
               direction="horizontal"
               class="max-h-[calc(100vh-13rem)]">
               <template #start>
                  <div class="h-full w-full relative">
                     <div
                        :ref="containerKey"
                        class="flex flex-1 h-full w-full absolute left-0 top-0"></div>
                  </div>
               </template>
               <template #end>
                  <div class="flex-1 h-full overflow-auto p-4">
                     <StMarkdownPreview :html="html" />
                  </div>
               </template>
            </StSplitPanel>
         </StSpace>
         <!-- Bottom -->
         <StSpace justify="end" class="p-4 w-full">
            <StButton
               @click="opened = false"
               class="py-[0.375rem] px-[1.25rem] text-accent-100 !rounded-[0.375rem]">
               <div class="flex gap-2 items-center">
                  <StIcon name="SaveOne" class="text-[1.5rem]" />
                  <span>保存</span>
               </div>
            </StButton>
         </StSpace>
      </StSpace>
   </StDrawer>
</template>
