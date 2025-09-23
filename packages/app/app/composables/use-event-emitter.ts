class EventEmitter {
   private listeners: Record<string, Array<Function>> = {};

   on(event: string, listener: Function) {
      if (!this.listeners[event]) {
         this.listeners[event] = [];
      }
      this.listeners[event].push(listener);
   }

   off(event: string, listener: Function) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(
         (l) => l !== listener
      );
   }

   emit(event: string, ...args: any[]) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach((listener) => listener(...args));
   }
}

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
