export const removeRootDir = (project: Record<string, string>) => {
   const newProject: Record<string, string> = {};
   for (const key in project) {
      const newKey = key.split('/').slice(2).join('/');
      newProject[newKey] = project[key]!;
   }
   return newProject;
};
