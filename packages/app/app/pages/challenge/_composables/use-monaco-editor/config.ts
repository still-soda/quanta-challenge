import type { editor } from 'monaco-editor';
import type { ThemeRegistrationRaw } from 'shiki';
import ayuDarkTheme from 'shiki/themes/ayu-dark.mjs';

import langVue from 'shiki/langs/vue.mjs';
import langTsx from 'shiki/langs/tsx.mjs';
import langJsx from 'shiki/langs/jsx.mjs';

export const langRegistrations = [langVue, langTsx, langJsx];

export const langs = ['javascript', 'typescript', 'html', 'css', 'json', 'vue'];

export const editorThemeRegistration: ThemeRegistrationRaw = ayuDarkTheme;

export const defaultEditorOptions: editor.IStandaloneEditorConstructionOptions =
   {
      theme: 'ayu-dark',
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
