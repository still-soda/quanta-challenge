/**
 * Transforms the specified fields of an object using a provided transformer function.
 * @param obj - The object whose fields are to be transformed.
 * @param key - An array of keys representing the fields to be transformed.
 * @param transformer - A function that takes a value and returns the transformed value.
 * @returns A new object with the specified fields transformed.
 * @example
 * ```ts
 * const original = { a: 1, b: 2, c: 3 };
 * const transformed = transformObjectFields(original, ['a', 'b'], (value) => value * 2);
 * console.log(transformed); // { a: 2, b: 4, c: 3 }
 * ```
 */
export const transformObjectFields = <
   T extends Record<string, any>,
   K extends keyof T,
   V extends any
>(
   obj: T,
   key: K[],
   transformer: (value: T[K]) => V
): {
   [P in keyof T]: P extends K ? V : T[P];
} => {
   const newObj: any = { ...obj };
   key.forEach((k) => {
      if (k in newObj) {
         newObj[k] = transformer(newObj[k]);
      }
   });
   return newObj;
};
