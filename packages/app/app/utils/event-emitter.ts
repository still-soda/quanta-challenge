export class EventEmitter<Event extends Record<string, any[]> = any> {
   private _listeners = new Map<keyof Event, Set<Function>>();

   on<T extends keyof Event>(event: T, listener: (...args: Event[T]) => void) {
      if (!this._listeners.has(event)) {
         this._listeners.set(event, new Set());
      }
      this._listeners.get(event)!.add(listener);
      return () => this.off(event, listener);
   }

   off<T extends keyof Event>(event: T, listener: (...args: Event[T]) => void) {
      if (!this._listeners.has(event)) return;
      this._listeners.get(event)!.delete(listener);
   }

   emit<T extends keyof Event>(event: T, ...args: Event[T]) {
      if (!this._listeners.has(event)) return;
      this._listeners.get(event)!.forEach((listener) => listener(...args));
   }

   clear(event?: keyof Event) {
      if (event) {
         this._listeners.delete(event);
      } else {
         this._listeners.clear();
      }
   }
}
