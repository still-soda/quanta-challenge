export const ignoreError = async <T>(
   fn: () => Promise<T>
): Promise<T | null> => {
   return fn().catch((error) => {
      console.error('An error occurred:', error);
      return null;
   });
};
