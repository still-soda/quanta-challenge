import { marked, Renderer } from 'marked';
import { useShiki } from './use-shiki';

export const useMarkdown = () => {
   const containerKey = 'markdown-container';
   const container = useTemplateRef<HTMLElement>(containerKey);
   const html = ref('');

   let hasMounted = false;

   const { highlighter } = useShiki();

   const renderer = new Renderer();

   renderer.code = ({ text, lang }) => {
      if (!highlighter.value) {
         return `<pre><code>${text}</code></pre>`;
      }
      try {
         return highlighter.value.codeToHtml(text, {
            lang: lang || ('text' as any),
            theme: 'github-dark',
         });
      } catch (e) {
         return `<pre><code>${text}</code></pre>`;
      }
   };

   const update = async (content: string) => {
      html.value = await marked.parse(content, {
         gfm: true,
         breaks: true,
         renderer: renderer,
      });
      if (hasMounted && container.value) {
         container.value.innerHTML = html.value;
      }
   };

   onMounted(() => {
      if (hasMounted) return;
      hasMounted = true;
      if (html.value && container.value) {
         container.value.innerHTML = html.value;
      }
   });

   return {
      containerKey,
      html,
      update,
   };
};
