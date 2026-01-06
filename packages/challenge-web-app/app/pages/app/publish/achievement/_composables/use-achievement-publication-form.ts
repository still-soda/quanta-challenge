import type { StForm } from '#components';
import type { IRule } from '~/components/st/Form/type';

export const useAchievementPublicationForm = () => {
   const formdata = reactive({
      name: '',
      description: '',
      imageId: '',
      dependencyData: [] as number[],
      preAchievements: [] as number[],
      rule: '',
      script: '',
      isCheckinAchievement: false,
      score: 50,
   });

   const formKey = 'publishForm';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);

   // 表单验证器规则
   const rules = ref<IRule[]>([
      {
         field: 'name',
         required: true,
         validator(value) {
            return value && value.length > 1;
         },
      },
      {
         field: 'description',
         required: true,
         validator(value) {
            return value && value.length > 0;
         },
      },
      {
         field: 'imageId',
         required: true,
         validator(value) {
            return value && value.length > 0;
         },
      },
      {
         field: 'rule',
         required: true,
         validator(value) {
            try {
               JSON.parse(value);
            } catch {
               return false;
            }
            return true;
         },
      },
      {
         field: 'script',
         required: true,
         validator(value) {
            return value && value.length > 0;
         },
      },
      {
         field: 'score',
         required: true,
         validator(value) {
            return (
               typeof value === 'number' &&
               value >= 0 &&
               value <= 1000 &&
               Number.isInteger(value)
            );
         },
      },
   ]);

   return {
      formdata,
      formKey,
      form,
      rules,
   };
};
