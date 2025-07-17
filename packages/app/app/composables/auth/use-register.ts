import { StForm } from '#components';

export const useRegister = () => {
   const formdata = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
   });
   const formKey = 'form';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);

   const loading = ref(false);
   const handleRegister = async () => {
      if (!form.value) return;
      const isValid = form.value.validate();
      if (isValid) {
         loading.value = true;
      }
   };

   return { formdata, formKey, loading, handleRegister };
};
