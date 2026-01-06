import type Pickr from '@simonwep/pickr';

export interface IUseColorOptions {
   swatches?: {
      external?: string[];
      override?: string[];
   };
   componentOptions?: Pickr.Options['components'];
   options?: Pickr.Options;
}

export const useColorPicker = (options?: IUseColorOptions) => {
   const containerKey = 'color-picker-container';
   const container = useTemplateRef<HTMLElement>(containerKey);

   let pickrInstance: Pickr | null = null;

   const defaultSwatches = [
      '#FA7C0E',
      '#14E87E',
      '#A6FB1D',
      '#FA2F32',
      '#C267FF',
      '#FFBE31',
   ];

   const onPickrReadyCallback = new Set<(instance: Pickr) => void>();
   const onPickrReady = (callback: (instance: Pickr) => void) => {
      if (pickrInstance) {
         callback(pickrInstance);
      } else {
         onPickrReadyCallback.add(callback);
      }
   };

   onMounted(async () => {
      if (!container.value) {
         throw new Error('Color picker container is not defined');
      }

      const Pickr = (await import('@simonwep/pickr')).default;

      pickrInstance = Pickr.create({
         el: container.value,
         theme: 'nano',
         default: '#FA7C0E',
         swatches: options?.swatches?.override
            ? options?.swatches?.override
            : defaultSwatches.concat(options?.swatches?.external ?? []),
         components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
               hex: true,
               rgba: false,
               input: true,
               clear: false,
               save: false,
            },
            ...options?.componentOptions,
         },
         ...options?.options,
      });

      onPickrReadyCallback.forEach((callback) => callback(pickrInstance!));
   });

   onUnmounted(() => {
      if (!pickrInstance) return;
      pickrInstance.destroyAndRemove();
      pickrInstance = null;
   });

   return {
      containerKey,
      onPickrReady,
      get pickr() {
         return pickrInstance;
      },
   };
};
