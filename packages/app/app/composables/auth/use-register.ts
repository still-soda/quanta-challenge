import { StForm } from '#components';
import useAuthStore from '~/stores/auth-store';

export const useRegister = () => {
   const formdata = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
   });
   const formKey = 'form';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);
   const authStore = useAuthStore();
   const { $trpc } = useNuxtApp();

   const loading = ref(false);
   const handleRegister = async () => {
      if (!form.value) return;
      const isValid = form.value.validate();
      if (!isValid) {
         console.error('Validation failed');
         return;
      }

      try {
         loading.value = true;
         const result = await $trpc.auth.register.email.mutate({
            username: formdata.username,
            email: formdata.email,
            password: formdata.password,
            confirmPassword: formdata.confirmPassword,
         });
         authStore.accessToken = result.tokens.accessToken;
         authStore.refreshToken = result.tokens.refreshToken;
         authStore.user = {
            name: result.user.name,
            id: result.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date(),
            imageId: null,
         };
         alert('Registration successful');
      } catch (error) {
         console.error('Registration failed:', error);
      } finally {
         loading.value = false;
      }
   };

   return { formdata, formKey, loading, handleRegister };
};
