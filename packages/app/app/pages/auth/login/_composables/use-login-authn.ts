import type StForm from '~/components/st/Form/index.vue';
import * as clientAuthn from '@simplewebauthn/browser';
import useAuthStore from '~/stores/auth-store';

export const useWebAuthnLogin = () => {
   const formdata = reactive({
      email: '',
   });

   const formKey = 'form';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);
   const authStore = useAuthStore();

   const { getCallback, on } = useStatusCallbacks<'success' | 'error'>();
   const onAuthenticateSuccess = (callback: Function) =>
      on('success', callback);
   const onAuthenticateError = (callback: Function) => on('error', callback);

   const loading = ref(false);
   const handleStartAuthenticating = async () => {
      if (!form.value) return;
      const isValid = form.value.validate().success;
      if (!isValid) {
         console.error('Validation failed');
         return;
      }

      try {
         loading.value = true;
         const { $trpc } = useNuxtApp();
         const option = await $trpc.auth.authn.authenticate.mutate({
            email: formdata.email,
         });
         const accessResponse = await clientAuthn.startAuthentication({
            optionsJSON: option,
         });
         const { csrfToken } =
            await $trpc.auth.authn.verifyAuthentication.mutate({
               accessResponse: accessResponse as any,
               email: formdata.email,
            });
         authStore.setCsrfToken(csrfToken);
         getCallback('success').forEach((cb) => cb());
      } catch (error) {
         getCallback('error').forEach((cb) => cb(error));
      } finally {
         loading.value = false;
      }
   };

   return {
      formdata,
      formKey,
      loading,
      handleStartAuthenticating,
      onAuthenticateSuccess,
      onAuthenticateError,
   };
};
