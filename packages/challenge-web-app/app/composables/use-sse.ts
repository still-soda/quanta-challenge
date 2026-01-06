export interface IUseSseOptions {
   url: string;
}

export const useSSE = <Event>(options: IUseSseOptions) => {
   const { url } = options;
   const eventSource = new EventSource(url);
   const event = ref<Event | null>(null);

   eventSource.onmessage = (e) => {
      event.value = JSON.parse(e.data);
   };

   const close = () => {
      eventSource.close();
   };

   return {
      event,
      close,
   };
};
