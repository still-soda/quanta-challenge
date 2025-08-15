interface IUseViewTransitionOptions {
   delay?: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useViewTransition = (options?: IUseViewTransitionOptions) => {
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
               options?.delay && (await delay(options.delay));
               await nextTick();
            });
         };
      }
   });

   return {
      startViewTransition,
   };
};
