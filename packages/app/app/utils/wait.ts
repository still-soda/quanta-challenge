export const wait = (ms: number): Promise<void> => {
   return new Promise((resolve) => setTimeout(resolve, ms));
};

export const atLeastTime = async (
   ms: number,
   promise: Promise<any>
): Promise<any> => {
   const [result] = await Promise.all([promise, wait(ms)]);
   return result;
};
