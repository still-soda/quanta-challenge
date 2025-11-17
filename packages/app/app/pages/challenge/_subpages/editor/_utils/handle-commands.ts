export type HandleCommandsResultItem = {
   command: string;
   title?: string;
};

/**
 * 处理多行命令字符串，支持可选标题
 * @param commands 多行命令字符串
 * @returns 解析后的命令数组
 * @example
 * ```ts
 * const commands = `[List Files] ls -la
 * [Show Current Directory] pwd
 * echo "Hello, World!"`;
 *
 * const result = handleCommands(commands);
 * // result:
 * // [
 * //   { title: 'List Files', command: 'ls -la' },
 * //   { title: 'Show Current Directory', command: 'pwd' },
 * //   { command: 'echo "Hello, World!"' }
 * // ]
 * ```
 */
export const handleCommands = (commands: string) => {
   const commandLines = commands
      .split('\n')
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);

   const result: HandleCommandsResultItem[] = commandLines.map((cmdLine) => {
      if (cmdLine.startsWith('[')) {
         const match = cmdLine.match(/^\[(.+?)\]\s*(.+)$/);
         if (match) {
            const title = match[1]!.trim();
            const command = match[2]!.trim();
            return { command, title };
         } else {
            return { command: cmdLine };
         }
      }
      return { command: cmdLine };
   });
   return result;
};
