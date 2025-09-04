export interface IUseQueryOptions<T = any> {
   defaultValue?: T;
   required?: boolean;
   parse?: (value: string) => T;
   onError?: () => void;
}

export const useQuery = <T = any>(
   name: string,
   options?: IUseQueryOptions<T>
) => {
   const route = useRoute();
   return computed(() => {
      const value = (route.query[name] as string) ?? options?.defaultValue;
      if (options?.required && value === undefined) {
         if (options.onError) {
            options.onError();
            return options?.defaultValue;
         } else {
            throw new Error(`Query "${name}" is required`);
         }
      }
      return options?.parse ? options.parse(value) : (value as T);
   });
};
