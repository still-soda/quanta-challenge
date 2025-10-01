import type { AddMessageOptions, MessageOperation } from './type';

type QuickMessageOptions = {
   duration?: number;
   closable?: boolean;
   loading?: boolean;
};

export const addMessagetKey = Symbol('st-message');

export function useMessage() {
   const addMessage = inject<
      ((options: AddMessageOptions) => MessageOperation) | null
   >(addMessagetKey, null);

   if (!addMessage) {
      throw new Error('useMessage must be used within a MessageProvider');
   }

   const success = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'success',
         title,
         content,
         ...options,
      });
   };

   const info = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'info',
         title,
         content,
         ...options,
      });
   };

   const warning = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'warning',
         title,
         content,
         ...options,
      });
   };

   const error = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'error',
         title,
         content,
         ...options,
      });
   };

   return {
      success,
      info,
      warning,
      error,
      custom: addMessage,
   };
}

export const addMessageOutsideVueKey = Symbol('st-message-outside-vue');

export function useMessageOutsideVue() {
   if (typeof globalThis === 'undefined') {
      throw new Error('useMessageOutsideVue can only be used in a browser');
   }

   const addMessage: (options: AddMessageOptions) => MessageOperation = (
      globalThis as any
   )?.[addMessageOutsideVueKey];

   if (!addMessage) {
      throw new Error('useMessageOutsideVue must be used after setup');
   }

   const success = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'success',
         title,
         content,
         ...options,
      });
   };

   const info = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'info',
         title,
         content,
         ...options,
      });
   };

   const warning = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'warning',
         title,
         content,
         ...options,
      });
   };

   const error = (
      title: string,
      content?: string,
      options?: QuickMessageOptions
   ) => {
      return addMessage({
         type: 'error',
         title,
         content,
         ...options,
      });
   };

   return {
      success,
      info,
      warning,
      error,
      custom: addMessage,
   };
}
