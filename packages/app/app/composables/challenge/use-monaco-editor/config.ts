import type { editor } from 'monaco-editor';
import type { BundledTheme } from 'shiki';

export const editorTheme: BundledTheme = 'ayu-dark';

export const defaultEditorOptions: editor.IStandaloneEditorConstructionOptions =
   {
      theme: editorTheme,
      automaticLayout: true,
      fontSize: 14,
      autoClosingBrackets: 'languageDefined',
      tabSize: 2,
      minimap: { enabled: false },
      cursorSmoothCaretAnimation: 'on',
      autoClosingQuotes: 'always',
      stickyScroll: {
         enabled: false,
      },
   };
