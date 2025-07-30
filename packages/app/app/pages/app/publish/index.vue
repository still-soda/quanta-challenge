<script setup lang="ts">
import type { SelectOption } from '~/components/st/Select/type';
import JudgeScript from './components/JudgeScript.vue';

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
});
const tagOptions: SelectOption[] = [
   { label: '算法', value: 'algorithm', icon: 'Acceleration' },
   { label: '数据结构', value: 'data-structure' },
   { label: '动态规划', value: 'dynamic-programming' },
   { label: '贪心算法', value: 'greedy' },
   { label: '图论', value: 'graph-theory' },
];

watch(
   () => formdata.score,
   (newScore) => {
      // 确保分数不小于0
      newScore !== undefined && newScore < 0 && (formdata.score = 0);
   }
);
</script>

<template>
   <StSpace justify="center" class="w-full h-full overflow-auto">
      <StSpace direction="vertical" gap="1.5rem" class="w-[44rem] my-6">
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
                     :options="tagOptions" />
               </StFormItem>
               <StFormItem name="difficulty" label="题目难度" required>
                  <StSlideRadioGroup
                     v-model:value="formdata.difficulty"
                     :options="[
                        { label: '简单', value: 'easy', color: '#A6FB1D' },
                        { label: '中等', value: 'medium', color: '#FFBE31' },
                        { label: '困难', value: 'hard', color: '#FA7C0E' },
                        {
                           label: '非常困难',
                           value: 'very-hard',
                           color: '#FA2F32',
                        },
                     ]" />
               </StFormItem>
            </StSpace>
         </StForm>
      </StSpace>
   </StSpace>
</template>
