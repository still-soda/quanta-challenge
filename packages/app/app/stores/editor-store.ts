export const useEditorStore = defineStore('editor', () => {
   const detailWindowOpened = ref(false);

   return {
      detailWindowOpened,
   };
});
