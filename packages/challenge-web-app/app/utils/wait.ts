export const wait = (ms: number): Promise<void> => {
   return new Promise((resolve) => setTimeout(resolve, ms));
};

export const atLeastTime = async <T extends Promise<any>>(
   ms: number,
   promise: T
) => {
   return new Promise(async (resolve, reject) => {
      const [result] = await Promise.all([
         promise.catch((err) => reject(err)),
         wait(ms),
      ]);
      resolve(result);
   }) as T;
};
