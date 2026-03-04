/**
 * 生成一个长度为 N 的数组类型，数组元素类型为 T
 * @template N 数组长度
 * @template T 数组元素类型
 * @template Accumulator 递归累加器，初始值为 []
 * @returns 长度为 N 的数组类型，元素类型为 T
 * @example
 * type ThreeStrings = Repeat<3, string>; // 结果类型为 [string, string, string]
 * type TwoNumbers = Repeat<2, number>;   // 结果类型为 [number, number]
 */
export type Repeat<
   N extends number,
   T,
   Accumulator extends T[] = [],
> = Accumulator['length'] extends N
   ? Accumulator
   : Repeat<N, T, [...Accumulator, T]>;
