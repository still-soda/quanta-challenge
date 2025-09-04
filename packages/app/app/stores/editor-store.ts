export const useEditorStore = defineStore('editor', () => {
   const detailWindowOpened = ref(false);
   const hasProjectInitialized = ref(false);

   return {
      detailWindowOpened,
      hasProjectInitialized,
   };
});
