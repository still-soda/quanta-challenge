export const useCallback = <T extends (...args: any[]) => any>(fn: T) => {
   let called = false;
   let result: ReturnType<T>;

   const onceFn = (...args: Parameters<T>): ReturnType<T> => {
      if (!called) {
         called = true;
         result = fn(...args);
      }
      return result;
   };
   onceFn.fn = fn; // 保留原函数引用
   onceFn.reset = () => {
      called = false;
      result = undefined as any; // 重置结果
   };

   return onceFn;
};
