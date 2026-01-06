type CallbackResponse<Status extends string> = {
   on: (status: Status, callback: Function) => void;
   off: (status: Status, callback: Function) => void;
   getCallback: (status: Status) => Function[];
};

export const useStatusCallbacks = <
   Status extends string
>(): CallbackResponse<Status> => {
   const callbacks = {} as Record<Status, Function[]>;

   const getCallback = (status: Status) => callbacks[status] ?? [];
   const on = (status: Status, callback: Function) => {
      callbacks[status] ??= [];
      callbacks[status].push(callback);
   };
   const off = (status: Status, callback: Function) => {
      callbacks[status] = callbacks[status]?.filter((cb) => cb !== callback);
   };

   return { on, off, getCallback };
};
