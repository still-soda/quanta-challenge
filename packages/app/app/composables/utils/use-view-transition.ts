export const useViewTransition = () => {
   let _startViewTransition = (callback: Function) => callback();

   const startViewTransition = (callback: Function) => {
      _startViewTransition(callback);
   };

   onMounted(() => {
      const isViewTransitionSupported =
         typeof document.startViewTransition === 'function';

      if (isViewTransitionSupported) {
         _startViewTransition = (callback: Function) => {
            document.startViewTransition(async () => {
               callback();
               await nextTick();
            });
         };
      }
   });

   return {
      startViewTransition,
   };
};
