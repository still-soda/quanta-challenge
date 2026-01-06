export interface IUsePreventLeaveOptions {
   onPrevent: () => void;
}

export const usePreventLeave = (options?: IUsePreventLeaveOptions) => {
   const enable = ref(true);

   const listener = (e: BeforeUnloadEvent) => {
      if (!enable.value) return;
      e.preventDefault();
      e.returnValue = '';
      options?.onPrevent();
      return '';
   };

   onMounted(() => {
      window.addEventListener('beforeunload', listener);
   });

   onUnmounted(() => {
      window.removeEventListener('beforeunload', listener);
   });

   return { enable };
};
