export function shouldUseBlackText(hex: string): boolean {
   // 去除 "#" 符号
   hex = hex.replace(/^#/, '');

   // 支持 #RGB 简写形式
   if (hex.length === 3) {
      hex = hex
         .split('')
         .map((char) => char + char)
         .join('');
   }

   if (hex.length !== 6) {
      throw new Error('Invalid HEX color');
   }

   // 转换为 RGB 数值
   const r = parseInt(hex.slice(0, 2), 16);
   const g = parseInt(hex.slice(2, 4), 16);
   const b = parseInt(hex.slice(4, 6), 16);

   // 计算亮度（luminance）
   const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

   // 判断是否使用黑色字体
   return luminance > 186;
}
