<script setup lang="ts">
import type { SelectOption } from '~/components/st/Select/type';
import JudgeScript from './components/JudgeScript.vue';
import ClosableTag from './components/ClosableTag.vue';
import type { SlideRadioGroupOption } from '~/components/st/SlideRadioGroup/type';
import UploadProject from './components/UploadProject.vue';
import UploadImage from './components/UploadImage.vue';
import MarkdownEditingDrawer from './components/MarkdownEditingDrawer.vue';

const outerClass = 'border !py-4 !px-4 !rounded-[0.5rem] w-full';

const formdata = reactive({
   title: '',
   description: '',
   score: undefined as number | undefined,
   tags: [],
   difficulty: undefined as
      | 'easy'
      | 'medium'
      | 'hard'
      | 'very-hard'
      | undefined,
   answerTemplate: {} as Record<string, string>,
   referenceAnswer: {} as Record<string, string>,
});
const tagOptions: SelectOption[] = [
   { label: '算法', value: 'algorithm', icon: 'Acceleration' },
   { label: '数据结构', value: 'data-structure' },
   { label: '动态规划', value: 'dynamic-programming' },
   { label: '贪心算法', value: 'greedy' },
   { label: '图论', value: 'graph-theory' },
];
const tagValueToLabel = (value: string) => {
   const option = tagOptions.find((option) => option.value === value);
   return option ? option.label : value;
};

const difficultyOptions: SlideRadioGroupOption[] = [
   { label: '简单', value: 'easy', color: '#A6FB1D' },
   { label: '中等', value: 'medium', color: '#FFBE31' },
   { label: '困难', value: 'hard', color: '#FA7C0E' },
   { label: '非常困难', value: 'very-hard', color: '#FA2F32' },
];

watch(
   () => formdata.score,
   (newScore) => {
      newScore !== undefined && newScore < 0 && (formdata.score = 0);
   }
);

const handleRemoveTag = (tag: string) => {
   formdata.tags = formdata.tags.filter((t) => t !== tag);
};

watch(formdata, () => console.log(formdata));

const coverModeOptions: SlideRadioGroupOption[] = [
   { label: '使用首屏截图', value: 'default', color: '#FA7C0E' },
   { label: '自定义封面', value: 'custom', color: '#FA7C0E' },
];
const coverMode = ref<'default' | 'custom'>('default');

const markdownEditing = ref(false);
</script>

<template>
   <StSpace justify="center" class="w-full h-full overflow-auto">
      <StSpace
         direction="vertical"
         gap="1.5rem"
         class="w-[44rem] pb-[10rem] my-6">
         <h1 class="st-font-hero-bold">发布题目</h1>
         <StForm class="w-full">
            <StSpace
               direction="vertical"
               gap="1.75rem"
               class="w-full px-[0.625rem]">
               <StFormItem name="title" label="题目标题" required>
                  <StInput
                     v-model:value="formdata.title"
                     placeholder="请输入3～15字的标题"
                     :outer-class />
               </StFormItem>
               <StFormItem name="description" label="题目描述" required>
                  <template #header-right>
                     <MarkdownEditingDrawer
                        v-model:opened="markdownEditing"
                        v-model:markdown="formdata.description" />
                     <div
                        @click="markdownEditing = !markdownEditing"
                        :class="[
                           'st-font-caption text-primary underline underline-offset-3',
                           'cursor-pointer hover:opacity-75 transition-opacity',
                        ]">
                        使用 md 编辑器
                     </div>
                  </template>
                  <StTextarea
                     rows="3"
                     placeholder="请输入题目描述"
                     v-model:value="formdata.description"
                     :outer-class />
               </StFormItem>
               <StFormItem name="score" label="题目总分" required>
                  <StInput
                     type="number"
                     v-model:value="formdata.score"
                     placeholder="请输入题目总分"
                     :outer-class />
               </StFormItem>
               <StFormItem name="judgeScript" label="判题脚本" required>
                  <JudgeScript />
               </StFormItem>
               <StFormItem name="tags" label="题目标签" required>
                  <StSelect
                     v-model:value="formdata.tags"
                     attach-to-body
                     placeholder="请选择题目标签"
                     multiple
                     :outer-class
                     :options="tagOptions">
                     <template #selected-preview="{ value }">
                        <div class="flex gap-2 flex-wrap w-full">
                           <ClosableTag
                              v-for="tag in value"
                              :key="tag"
                              :content="tagValueToLabel(tag)"
                              @click.stop
                              @close="handleRemoveTag(tag)" />
                        </div>
                     </template>
                  </StSelect>
               </StFormItem>
               <StFormItem name="difficulty" label="题目难度" required>
                  <StSlideRadioGroup
                     v-model:value="formdata.difficulty"
                     :options="difficultyOptions" />
               </StFormItem>
               <StFormItem name="cover" label="封面图片" required>
                  <StSlideRadioGroup
                     v-model:value="coverMode"
                     :options="coverModeOptions" />
                  <UploadImage
                     v-show="coverMode === 'custom'"
                     placeholder="请选择封面图片" />
               </StFormItem>
               <StFormItem name="answerTemplate" label="作答模板" required>
                  <UploadProject
                     placeholder="上传答题初始化模板文件夹"
                     v-model:project-fs="formdata.answerTemplate" />
               </StFormItem>
               <StFormItem
                  name="referenceAnswer"
                  label="参考答案"
                  :required="coverMode === 'default'">
                  <UploadProject
                     placeholder="上传打包后的参考答案文件夹"
                     v-model:project-fs="formdata.referenceAnswer" />
               </StFormItem>
            </StSpace>
            <StSpace justify="between" align="center" class="px-2 mt-[2.13rem]">
               <div class="text-accent-300">已经自动保存</div>
               <StButton
                  class="py-[0.375rem] px-[1.25rem] text-accent-100 !rounded-[0.375rem]">
                  <div class="flex gap-2 items-center">
                     <StIcon name="UploadTwo" class="text-[1.5rem]" />
                     <span>提交审核</span>
                  </div>
               </StButton>
            </StSpace>
         </StForm>
      </StSpace>
   </StSpace>
</template>
