import type { TemplateRef } from 'vue';

export type CursorType =
   | 'auto'
   | 'default'
   | 'pointer'
   | 'text'
   | 'move'
   | 'wait'
   | 'help'
   | 'col-resize'
   | 'row-resize';

export interface IUseDefaultCursorOptions {
   el: HTMLElement | TemplateRef<HTMLElement> | Ref<HTMLElement | null>;
}

export const useDefaultCursor = (options: IUseDefaultCursorOptions) => {
   const cursor = ref<CursorType>('auto');
   const element = computed(() => {
      return options.el instanceof HTMLElement ? options.el : unref(options.el);
   });

   onMounted(() => {
      const el = element.value;
      if (!el) {
         throw new Error('Element not found');
      }

      const pointerObserver = new MutationObserver((mutations) => {
         mutations.forEach((m) => {
            if (
               m.type === 'attributes' &&
               m.attributeName === 'style' &&
               el.style.cursor !== cursor.value
            ) {
               cursor.value = (el.style.cursor as CursorType) || 'auto';
            }
         });
      });
      pointerObserver.observe(el, {
         attributes: true,
         attributeFilter: ['style'],
      });

      onUnmounted(() => {
         pointerObserver.disconnect();
      });
   });

   const reset = () => {
      element.value && (element.value.style.cursor = 'auto');
   };

   const set = (value: CursorType) => {
      element.value && (element.value.style.cursor = value);
   };

   return { cursor, reset, set };
};
