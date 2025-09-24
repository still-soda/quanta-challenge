export const url = (
   baseUrl: string,
   path?: string,
   params?: Record<string, any>
) => {
   const parmas = new URLSearchParams(
      params as Record<string, string>
   ).toString();
   return new URL(path ? path + '?' + parmas : '', baseUrl).toString();
};
