import type { WebContainerProcess } from '@webcontainer/api';
import type { Terminal } from 'xterm';
import type { FitAddon } from 'xterm-addon-fit';

type TerminalReadyCallback = (terminal: Terminal, fitAddon: FitAddon) => void;

export const useTerminal = () => {
   const containerKey = 'terminal-container';
   const container = useTemplateRef<HTMLElement>(containerKey);

   let terminalInstance: Terminal | null = null;
   let fitAddonInstance: FitAddon | null = null;

   const terminalReadyCallbacks = new Set<TerminalReadyCallback>();
   const onTerminalReady = (callback: TerminalReadyCallback) => {
      if (terminalInstance && fitAddonInstance) {
         return callback(terminalInstance, fitAddonInstance);
      }
      terminalReadyCallbacks.add(callback);
   };

   const getInstance = () => {
      return new Promise<{
         terminal: Terminal;
         fitAddon: FitAddon;
      }>((resolve) => {
         onTerminalReady((terminal, fitAddon) => {
            resolve({ terminal, fitAddon });
         });
      });
   };

   const attachProcess = async (process: WebContainerProcess) => {
      const { terminal } = await getInstance();
      const writer = process.input.getWriter();

      terminal.onData((data) => {
         writer.write(data);
      });

      process.output.pipeTo(
         new WritableStream({
            write(chunk) {
               terminal.write(chunk);
            },
         })
      );
   };

   onMounted(async () => {
      if (!container.value) {
         throw new Error('Terminal container not found');
      }
      const [{ Terminal }, { FitAddon }] = await Promise.all([
         import('xterm'),
         import('xterm-addon-fit'),
      ]);
      terminalInstance = new Terminal({
         convertEol: true,
         fontSize: 12,
         fontFamily: '"FiraCode Nerd Font Mono", "Microsoft YaHei", monospace',
      });
      fitAddonInstance = new FitAddon();

      terminalInstance.open(container.value);
      terminalInstance.loadAddon(fitAddonInstance);
      fitAddonInstance.fit();

      terminalReadyCallbacks.forEach((callback) =>
         callback(terminalInstance!, fitAddonInstance!)
      );
   });

   return {
      containerKey,
      onTerminalReady,
      getInstance,
      container,
      attachProcess,
   };
};
