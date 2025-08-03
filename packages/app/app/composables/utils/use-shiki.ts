import {
   createHighlighter,
   type Highlighter,
   type BundledHighlighterOptions,
   type BundledLanguage,
   type BundledTheme,
} from 'shiki';

type HighlighterOptions = BundledHighlighterOptions<
   BundledLanguage,
   BundledTheme
>;

export interface IUseShikiOptions {
   languages?: HighlighterOptions['langs'];
   theme?: HighlighterOptions['themes'];
}

export const useShiki = (options?: IUseShikiOptions) => {
   const highlighter = ref<Highlighter>();
   const hasReady = ref(false);

   const readyCallbacks = new Set<() => void>();
   const onReady = (callback: () => void) => {
      if (hasReady.value) {
         callback();
         return;
      }
      readyCallbacks.add(callback);
   };

   const init = async () => {
      try {
         highlighter.value = await createHighlighter({
            themes: [options?.theme || ('github-dark' as any)],
            langs: [
               'typescript',
               'javascript',
               'vue',
               'html',
               'css',
               'yaml',
               'json',
               ...(options?.languages ?? []),
            ],
         });
         hasReady.value = true;
      } catch (error) {
         console.error('Failed to initialize highlighter:', error);
      }
   };
   onMounted(init);

   const highlightHtml = ref('');
   let firstTimeReady = false;
   const highlightCode = async (
      code: string,
      lang?: HighlighterOptions['langs'][number]
   ) => {
      if (!hasReady.value) return;
      if (!highlighter.value) {
         await init();
         if (!highlighter.value) return;
      }
      highlightHtml.value = highlighter.value.codeToHtml(code, {
         lang: lang || ('typescript' as any),
         theme: options?.theme || ('github-dark' as any),
      });
      if (!firstTimeReady) {
         readyCallbacks.forEach((cb) => cb());
         firstTimeReady = true;
      }
      return highlightHtml;
   };

   onUnmounted(() => {
      highlighter.value?.dispose();
      highlighter.value = void 0;
   });

   return {
      onReady,
      highlighter,
      hasReady,
      highlightCode,
      highlightHtml,
   };
};
