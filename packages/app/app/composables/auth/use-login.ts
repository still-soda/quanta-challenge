import type { StForm } from '#components';

export const useLogin = () => {
   const formdata = reactive({
      email: '',
      password: '',
   });
   const formKey = 'form';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);
   const loading = ref(false);

   const handleLogin = async () => {
      if (!form.value) return;
      const isValid = form.value.validate();
      if (isValid) {
         loading.value = true;
         console.log('Login data:', formdata);
      } else {
         console.error('Validation failed');
      }
   };

   return { formdata, formKey, loading, handleLogin };
};
