import { EventEmitter } from '~/utils/event-emitter';

const emitters = new Map<string | symbol, EventEmitter>();

export const useEventEmitter = <T = any>(
   emitterId: string | symbol,
   eventName?: string
) => {
   const event = ref<T | null>(null);

   if (!emitters.has(emitterId)) {
      emitters.set(emitterId, new EventEmitter());
   }
   const emitter = emitters.get(emitterId)!;

   const callback = (data: T) => {
      event.value = data;
   };

   eventName && emitter.on(eventName, callback);

   const off = () => {
      eventName && emitter.off(eventName, callback);
   };

   const emit = (data: T) => {
      eventName && emitter.emit(eventName, data);
   };

   return { event, emit, off, emitter };
};
