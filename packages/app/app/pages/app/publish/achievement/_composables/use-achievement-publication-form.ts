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
   ]);

   return {
      formdata,
      formKey,
      form,
      rules,
   };
};
