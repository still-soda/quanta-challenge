<script setup lang="ts">
import JudgeScript from './components/JudgeScript.vue';
import type { ISlideRadioGroupOption } from '~/components/st/SlideRadioGroup/type';
import UploadProject from './components/UploadProject.vue';
import UploadImage from './components/UploadImage.vue';
import MarkdownEditingDrawer from './components/MarkdownEditingDrawer.vue';
import TagsPicker from './components/TagsPicker.vue';
import type { IRule } from '~/components/st/Form/type';
import { ignores } from '~/components/st/DropUploader/default-ignore';
import type { StForm } from '#components';

const outerClass = 'border !py-4 !px-4 !rounded-[0.5rem] w-full';

const { $trpc } = useNuxtApp();
const formdata = useLocalStorage('publishFormdata', {
   title: '',
   detail: '',
   judgeScript: '',
   score: undefined as number | undefined,
   tags: [] as number[],
   difficulty: undefined as
      | 'easy'
      | 'medium'
      | 'hard'
      | 'very_hard'
      | undefined,
   answerTemplate: {} as Record<string, string>,
   referenceAnswer: {} as Record<string, string>,
   coverMode: 'default' as 'default' | 'custom',
   coverImageId: undefined as string | undefined,
});
const draft = useDebounce(formdata, 200);

// 题目难度选项
const difficultyOptions: ISlideRadioGroupOption[] = [
   { label: '简单', value: 'easy', color: '#A6FB1D' },
   { label: '中等', value: 'medium', color: '#FFBE31' },
   { label: '困难', value: 'hard', color: '#FA7C0E' },
   { label: '非常困难', value: 'very-hard', color: '#FA2F32' },
];

// 确保分数不小于0
watch(
   () => draft.value.score,
   (newScore) => {
      newScore !== undefined && newScore < 0 && (draft.value.score = 0);
   }
);

// 封面
const coverModeOptions: ISlideRadioGroupOption[] = [
   { label: '使用首屏截图', value: 'default', color: '#FA7C0E' },
   { label: '自定义封面', value: 'custom', color: '#FA7C0E' },
];

// 编辑器
const markdownEditing = ref(false);

// rules
const rules = ref<IRule[]>([
   {
      name: 'title',
      required: true,
      validator(value) {
         return value && value.length > 15;
      },
   },
   {
      name: 'detail',
      required: true,
      validator(value) {
         return value && value.length > 0;
      },
   },
   {
      name: 'score',
      required: true,
      validator(value) {
         return value !== undefined && value >= 0;
      },
   },
   {
      name: 'tags',
      required: true,
      validator(value) {
         return value.length > 0;
      },
   },
   {
      name: 'difficulty',
      required: true,
      validator(value) {
         return value !== undefined;
      },
   },
   {
      name: 'answerTemplate',
      required: true,
      validator(value) {
         return Object.keys(value).length > 0;
      },
   },
   {
      name: 'referenceAnswer',
      required: draft.value.coverMode === 'default',
      validator(value) {
         return Object.keys(value).length > 0;
      },
   },
   {
      name: 'coverMode',
      required: true,
      validator(value) {
         return value !== undefined;
      },
   },
   {
      name: 'coverImageId',
      required: draft.value.coverMode === 'custom',
      validator(value) {
         return draft.value.coverMode === 'default' || value;
      },
   },
]);
const form = useTemplateRef<InstanceType<typeof StForm>>('form');

const removeRootDir = (project: Record<string, string>) => {
   const newProject: Record<string, string> = {};
   for (const key in project) {
      const newKey = key.split('/').slice(2).join('/');
      newProject[newKey] = project[key]!;
   }
   return newProject;
};

// 提交
const submitLoading = ref(false);
const handleSubmit = async () => {
   const upload = async () =>
      await $trpc.admin.problem.upload.mutate({
         title: draft.value.title,
         detail: draft.value.detail,
         totalScore: draft.value.score ?? 0,
         tagIds: draft.value.tags,
         difficulty: draft.value.difficulty!,
         judgeScript: draft.value.judgeScript,
         answerTemplateSnapshot: removeRootDir(draft.value.answerTemplate),
         referenceAnswerSnapshot: removeRootDir(draft.value.referenceAnswer),
         coverMode: draft.value.coverMode,
      });
   submitLoading.value = true;
   await atLeastTime(500, upload())
      .catch((error) => {
         alert('发布题目失败:' + error);
      })
      .finally(() => {
         submitLoading.value = false;
      });
};
</script>

<template>
   <StSpace justify="center" class="w-full h-full overflow-auto">
      <StSpace
         direction="vertical"
         gap="1.5rem"
         class="w-[44rem] pb-[10rem] my-6">
         <h1 class="st-font-hero-bold">发布题目</h1>
         <StForm
            ref="form"
            v-model:model-value="formdata"
            :rules="rules"
            class="w-full">
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
                        v-model:markdown="formdata.detail" />
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
                     v-model:value="formdata.detail"
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
                  <JudgeScript v-model:script="formdata.judgeScript" />
               </StFormItem>
               <StFormItem name="tags" label="题目标签" required>
                  <TagsPicker v-model:tags="formdata.tags" :outer-class />
               </StFormItem>
               <StFormItem name="difficulty" label="题目难度" required>
                  <StSlideRadioGroup
                     v-model:value="formdata.difficulty"
                     :options="difficultyOptions" />
               </StFormItem>
               <StFormItem name="cover" label="封面图片" required>
                  <StSlideRadioGroup
                     v-model:value="formdata.coverMode"
                     :options="coverModeOptions" />
                  <UploadImage
                     v-show="formdata.coverMode === 'custom'"
                     v-model:image-id="formdata.coverImageId"
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
                  :required="formdata.coverMode === 'default'">
                  <UploadProject
                     :ignore-directories="
                        ignores.directories.filter((i) => i !== 'dist')
                     "
                     placeholder="上传打包后的参考答案文件夹"
                     v-model:project-fs="formdata.referenceAnswer" />
               </StFormItem>
            </StSpace>
            <StSpace justify="between" align="center" class="px-2 mt-[2.13rem]">
               <div class="text-accent-300">已经自动保存</div>
               <StButton
                  :loading="submitLoading"
                  @click="handleSubmit"
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
