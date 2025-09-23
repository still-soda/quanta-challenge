import {
   type BundledHighlighterOptions,
   type BundledLanguage,
   type BundledTheme,
   type ThemeRegistrationRaw,
   type LanguageRegistration,
   type HighlighterCore,
   createHighlighterCoreSync,
   createJavaScriptRegexEngine,
} from 'shiki';

import ayuDarkTheme from 'shiki/themes/ayu-dark.mjs';

import langTsx from 'shiki/langs/tsx.mjs';

type HighlighterOptions = BundledHighlighterOptions<
   BundledLanguage,
   BundledTheme
>;

export interface IUseShikiOptions {
   languages?: LanguageRegistration[][];
   theme?: ThemeRegistrationRaw;
}

export const useShiki = (options?: IUseShikiOptions) => {
   const highlighter = ref<HighlighterCore>();
   const hasReady = ref(false);

   const readyCallbacks = new Set<() => void>();
   const onReady = (callback: () => void) => {
      if (hasReady.value) {
         callback();
         return;
      }
      readyCallbacks.add(callback);
   };

   const init = () => {
      try {
         highlighter.value = createHighlighterCoreSync({
            themes: [options?.theme || ayuDarkTheme],
            langs: [langTsx, ...(options?.languages ?? [])],
            engine: createJavaScriptRegexEngine(),
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
         init();
         if (!highlighter.value) return;
      }
      highlightHtml.value = highlighter.value.codeToHtml(code, {
         lang: lang || ('typescript' as any),
         theme: options?.theme || ('ayu-dark' as any),
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
