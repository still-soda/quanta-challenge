export interface IUseParamOptions<T = any> {
   defaultValue?: T;
   required?: boolean;
   parse?: (value: string) => T;
   onError?: () => void;
}

export const useParam = <T = any>(
   name: string,
   options?: IUseParamOptions<T>
) => {
   const route = useRoute();
   return computed(() => {
      const value = (route.params[name] as string) ?? options?.defaultValue;
      if (options?.required && value === undefined) {
         if (options.onError) {
            options.onError();
            return options?.defaultValue;
         } else {
            throw new Error(`Param "${name}" is required`);
         }
      }
      return options?.parse ? options.parse(value) : (value as T);
   });
};
