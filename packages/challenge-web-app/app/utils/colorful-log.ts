interface IPrintable {
   text: string;
   style: string;
}

interface IPrinter {
   (template: TemplateStringsArray, ...args: any[]): {
      text: string;
      style: string;
   };
   bold: IPrinter;
}

const isPrinter = (obj: any): obj is IPrinter => {
   return typeof obj === 'function' && 'bold' in obj;
};

function colorful(color: string): IPrinter {
   const printer = (template: TemplateStringsArray, ...args: any[]) => {
      let text = '';
      template.forEach((part, i) => {
         text += part + (i < args.length ? args[i].toString() : '');
      });
      const style = `color: ${color};` + (_bold ? ' font-weight: bold;' : '');
      _bold = false; // 重置状态，确保每次调用后状态单一
      return { text, style };
   };

   let _bold = false;
   Object.defineProperty(printer, 'bold', {
      get() {
         _bold = true;
         return printer;
      },
   });

   return printer as IPrinter;
}

export const red = colorful('red');
export const green = colorful('green');
export const blue = colorful('blue');
export const yellow = colorful('orange');
export const purple = colorful('purple');
export const cyan = colorful('cyan');
export const gray = colorful('gray');
export const color = colorful;

function hexToAnsi(hex: string) {
   const cleanHex = hex.replace('#', '');
   const r = parseInt(cleanHex.slice(0, 2), 16);
   const g = parseInt(cleanHex.slice(2, 4), 16);
   const b = parseInt(cleanHex.slice(4, 6), 16);
   return `\x1b[38;2;${r};${g};${b}m`;
}

const colorHexMap: Record<string, string> = {
   red: '#FF0000',
   green: '#00FF00',
   blue: '#0000FF',
   orange: '#FFA500',
   purple: '#800080',
   cyan: '#00FFFF',
   gray: '#808080',
};

/**
 * pretty log
 * @example
 * ```ts
 * console.log(...pl('普通文本', red`红色文本`, green.bold`加粗绿色文本`));
 * ```
 */
export const pl = (...printables: (IPrintable | string)[]) => {
   if (import.meta.env.client) {
      const texts: string[] = [];
      const styles: string[] = [];

      printables.forEach((item) => {
         if (typeof item === 'string') {
            texts.push('%c' + item);
            styles.push('');
         } else if (isPrinter(item)) {
            const result = item`${item}`;
            texts.push('%c' + result.text);
            styles.push(result.style);
         } else {
            texts.push('%c' + item.text);
            styles.push(item.style);
         }
      });

      return [texts.join(' '), ...styles];
   } else {
      // 服务器端环境，返回 ANSI 转义码
      return [
         printables
            .map((item) => {
               if (typeof item === 'string') {
                  return item;
               } else if (isPrinter(item)) {
                  // 解析颜色名称
                  const colorMatch = item.style.match(/color:\s*([^;]+);?/);
                  let colorValue = colorMatch ? colorMatch[1]!.trim() : 'gray';

                  // 如果是颜色名称，转换为十六进制
                  if (colorHexMap[colorValue]) {
                     colorValue = colorHexMap[colorValue]!;
                  }

                  const ansiColor = hexToAnsi(colorValue);
                  const isBold = /font-weight:\s*bold;?/.test(item.style);
                  const boldCode = isBold ? '\x1b[1m' : '';
                  return `${ansiColor}${boldCode}${item.text}\x1b[0m`;
               } else {
                  // 解析颜色名称
                  const colorMatch = item.style.match(/color:\s*([^;]+);?/);
                  let colorValue = colorMatch ? colorMatch[1]!.trim() : 'gray';

                  // 如果是颜色名称，转换为十六进制
                  if (colorHexMap[colorValue]) {
                     colorValue = colorHexMap[colorValue]!;
                  }

                  const ansiColor = hexToAnsi(colorValue);
                  const isBold = /font-weight:\s*bold;?/.test(item.style);
                  const boldCode = isBold ? '\x1b[1m' : '';
                  return `${ansiColor}${boldCode}${item.text}\x1b[0m`;
               }
            })
            .join(' '),
      ];
   }
};
