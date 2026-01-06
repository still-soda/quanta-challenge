/**
 * 使用提供的转换函数转换对象的指定字段。
 * @param obj - 要转换字段的对象。
 * @param key - 表示要转换字段的键数组。
 * @param transformer - 一个接受值并返回转换后值的函数。
 * @returns 一个新对象，其中指定字段已被转换。
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

/**
 * 使用提供的映射函数映射对象的所有字段。
 * @param obj - 要映射字段的对象。
 * @param valueMapper - 一个接受键值对并返回映射值的函数。
 * @param keyMapper - 可选的一个接受键值对并返回新键的函数。
 * @returns 一个新对象，其中指定字段已被映射。
 */
export const objectMap = <T extends Record<string, any>, V extends any>(
   obj: T,
   valueMapper: ({ key, value }: { key: keyof T; value: T[keyof T] }) => V,
   keyMapper?: ({ key, value }: { key: keyof T; value: T[keyof T] }) => string
): {
   [P in keyof T]: V;
} => {
   const newObj: any = {};
   for (const k in obj) {
      const key = keyMapper ? keyMapper({ key: k, value: obj[k] }) : k;
      newObj[key] = valueMapper({ key: k, value: obj[k] });
   }
   return newObj;
};
