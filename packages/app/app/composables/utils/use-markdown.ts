import { marked } from 'marked';

export const useMarkdown = () => {
   const containerKey = 'markdown-container';
   const container = useTemplateRef<HTMLElement>(containerKey);
   const html = ref('');

   let hasMounted = false;

   const update = async (content: string) => {
      html.value = await marked.parse(content, {
         gfm: true,
         breaks: true,
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
