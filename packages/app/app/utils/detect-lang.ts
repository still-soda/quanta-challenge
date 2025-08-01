export const detectLanguage = (fileName: string): string => {
   const ext = fileName.split('.').pop()?.toLowerCase();
   const languageMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      vue: 'vue',
      tsx: 'typescript',
      jsx: 'javascript',
   };

   return ext ? languageMap[ext] || 'Unknown' : 'Unknown';
};
