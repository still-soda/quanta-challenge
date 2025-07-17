import type { StForm } from '#components';
import useAuthStore from '~/stores/auth-store';

export const useLogin = () => {
   const formdata = reactive({
      email: '',
      password: '',
   });
   const formKey = 'form';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);
   const loading = ref(false);

   const { $trpc } = useNuxtApp();
   const authStore = useAuthStore();

   const handleLogin = async () => {
      if (!form.value) return;
      const isValid = form.value.validate();
      if (!isValid) {
         console.error('Validation failed');
         return;
      }

      try {
         loading.value = true;
         const result = await $trpc.auth.login.email.query({
            email: formdata.email,
            password: formdata.password,
         });
         authStore.accessToken = result.tokens.accessToken;
         authStore.refreshToken = result.tokens.refreshToken;
         authStore.user = {
            ...result.user,
            lastLogin: new Date(result.user.lastLogin),
            createdAt: new Date(result.user.createdAt),
            updatedAt: new Date(result.user.updatedAt),
         };
         alert('Login successful');
      } catch (error) {
         console.error('Login failed:', error);
      } finally {
         loading.value = false;
      }
   };

   return { formdata, formKey, loading, handleLogin };
};
