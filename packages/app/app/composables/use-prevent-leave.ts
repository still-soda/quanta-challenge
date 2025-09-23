export const usePreventLeave = () => {
   const enable = ref(true);

   const listener = (e: BeforeUnloadEvent) => {
      if (!enable.value) return;
      e.preventDefault();
      e.returnValue = '';
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
