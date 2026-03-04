import type StForm from '~/components/st/Form/index.vue';
import * as clientAuthn from '@simplewebauthn/browser';
import useAuthStore from '~/stores/auth-store';

export const useRegisterAuthn = () => {
   const formKey = 'webauthnForm';
   const form = useTemplateRef<InstanceType<typeof StForm>>(formKey);
   const loading = ref(false);

   const { $trpc } = useNuxtApp();

   const { getCallback, on } = useStatusCallbacks<'success' | 'error'>();
   const onRegisterSuccess = (callback: Function) => on('success', callback);
   const onRegisterError = (callback: Function) => on('error', callback);

   const handleRegister = async () => {
      if (!form.value) return;
      const isValid = form.value.validate().success;
      if (!isValid) {
         console.error('Validation failed');
         return;
      }

      try {
         loading.value = true;
         const option = await $trpc.auth.authn.register.mutate();
         const accessResponse = await clientAuthn.startRegistration({
            optionsJSON: option,
         });
         await $trpc.auth.authn.verifyRegistration.mutate(
            accessResponse as any,
         );
         getCallback('success').forEach((cb) => cb());
      } catch (error) {
         getCallback('error').forEach((cb) => cb(error));
      } finally {
         loading.value = false;
      }
   };

   return {
      formKey,
      loading,
      handleRegister,
      onRegisterError,
      onRegisterSuccess,
   };
};
