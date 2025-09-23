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

   const { getCallback, on } = useStatusCallbacks<'success' | 'error'>();
   const onRegisterSuccess = (callback: Function) => on('success', callback);
   const onRegisterError = (callback: Function) => on('error', callback);

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
         authStore.setTokens({
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
         });
         authStore.user = {
            name: result.user.name,
            id: result.user.id,
            email: result.user.email,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date(),
            imageId: null,
            role: 'USER',
         };
         getCallback('success').forEach((cb) => cb());
      } catch (error) {
         getCallback('error').forEach((cb) => cb());
      } finally {
         loading.value = false;
      }
   };

   return {
      formdata,
      formKey,
      loading,
      handleRegister,
      onRegisterSuccess,
      onRegisterError,
   };
};
