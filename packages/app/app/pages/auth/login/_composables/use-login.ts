import type StForm from '~/components/st/Form/index.vue';
import useAuthStore from '~/stores/auth-store';

export const useEmailLogin = () => {
   const formdata = reactive({
      email: '',
      password: '',
   });
   const formKey = 'form';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);
   const loading = ref(false);

   const { $trpc } = useNuxtApp();
   const authStore = useAuthStore();

   const { getCallback, on } = useStatusCallbacks<'success' | 'error'>();
   const onLoginSuccess = (callback: Function) => on('success', callback);
   const onLoginError = (callback: Function) => on('error', callback);

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
         authStore.setTokens({
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
         });
         authStore.user = {
            ...result.user,
            lastLogin: new Date(result.user.lastLogin),
            createdAt: new Date(result.user.createdAt),
            updatedAt: new Date(result.user.updatedAt),
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
      handleLogin,
      onLoginSuccess,
      onLoginError,
   };
};
