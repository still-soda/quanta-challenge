import type { IRule } from '~/components/st/Form/type';

export type FieldStatus = 'default' | 'success' | 'error';

export const getFieldStatus = <Rules extends IRule[]>(
   rules: Rules,
   formdata: Record<string, any>,
   field: Rules[number]['field']
): FieldStatus => {
   const rule = rules.find((r) => r.field === field);
   if (!rule) {
      return 'default';
   }
   const value = formdata[field];
   if (rule.required && (value === undefined || value === '')) {
      return 'default';
   }
   if (rule.validator && !rule.validator(value)) {
      return 'error';
   }
   return 'success';
};

export const getFieldSatusAsync = async <Rules extends IRule[]>(
   rules: Rules,
   formdata: Record<string, any>,
   field: Rules[number]['field']
): Promise<FieldStatus> => {
   const rule = rules.find((r) => r.field === field);
   if (!rule) {
      return 'default';
   }
   const value = formdata[field];
   if (rule.required && (value === undefined || value === '')) {
      return 'default';
   }
   if (rule.validator) {
      const isValid = await rule.validator(value);
      if (!isValid) {
         return 'error';
      }
   }
   return 'success';
};

export const useAsyncStatus = <Rules extends IRule[]>(
   rules: Rules,
   formdata: Record<string, any>
) => {
   const statusMap = reactive<Record<string, FieldStatus>>({});

   for (const rule of rules) {
      watch(
         () => formdata[rule.field],
         async () => {
            statusMap[rule.field] = await getFieldSatusAsync(
               rules,
               formdata,
               rule.field
            );
         },
         { immediate: true }
      );
   }
   return statusMap as Record<Rules[number]['field'], FieldStatus>;
};
