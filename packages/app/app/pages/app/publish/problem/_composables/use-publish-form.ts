import type { StForm } from '#components';
import type { IRule } from '~/components/st/Form/type';
import type { ISlideRadioGroupOption } from '~/components/st/SlideRadioGroup/type';

// 题目难度选项
const difficultyOptions: ISlideRadioGroupOption[] = [
   { label: '简单', value: 'easy', color: '#A6FB1D' },
   { label: '中等', value: 'medium', color: '#FFBE31' },
   { label: '困难', value: 'hard', color: '#FA7C0E' },
   { label: '非常困难', value: 'very_hard', color: '#FA2F32' },
];

// 封面选项
const coverModeOptions: ISlideRadioGroupOption[] = [
   { label: '使用首屏截图', value: 'default', color: '#FA7C0E' },
   { label: '自定义封面', value: 'custom', color: '#FA7C0E' },
];

export const usePublishForm = (storageName: string) => {
   const formdata = useLocalStorage(storageName, {
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

   const formKey = 'publishForm';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);

   // 表单验证器规则
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

   return {
      draft,
      formKey,
      form,
      rules,
      difficultyOptions,
      coverModeOptions,
   };
};
