<script setup lang="ts">
import {
   assignFormItemKey,
   type IAssignFormItemOptions,
   type IRule,
} from './type';

const optionsMap = new Map<string, IAssignFormItemOptions>();

const assignFormItem = (options: IAssignFormItemOptions) => {
   optionsMap.set(options.name, options);
};
provide(assignFormItemKey, assignFormItem);

const formdata = defineModel<Record<string, any>>({
   default: () => ({}),
});
const props = defineProps<{
   rules?: IRule[];
}>();

const validate = () => {
   const rules = props.rules || [];
   const formdataKeySet = new Set(Object.keys(formdata.value));
   const rulesToValidate = rules.filter((rule) => {
      return optionsMap.has(rule.field) && formdataKeySet.has(rule.field);
   });
   let success = true;
   let invalidField: string | null = null;
   for (const rule of rulesToValidate) {
      const options = optionsMap.get(rule.field);
      if (options) {
         const value = formdata.value[rule.field];
         if (rule.required && !value) {
            options.setStatus('error');
            invalidField = rule.field;
            success = false;
            continue;
         }
         if (rule.validator && !rule.validator(value)) {
            options.setStatus('error');
            invalidField = rule.field;
            success = false;
            continue;
         }
         options.setStatus('success');
      }
   }
   return { success, invalidField };
};

const validateAsync = async () => {
   const rules = props.rules || [];
   const formdataKeySet = new Set(Object.keys(formdata.value));
   const rulesToValidate = rules.filter((rule) => {
      return optionsMap.has(rule.field) && formdataKeySet.has(rule.field);
   });
   let success = true;
   let invalidField: string | null = null;
   for (const rule of rulesToValidate) {
      const options = optionsMap.get(rule.field);
      if (options) {
         const value = formdata.value[rule.field];
         if (rule.required && !value) {
            options.setStatus('error');
            invalidField = rule.field;
            success = false;
            continue;
         }
         // Changed line
         if (rule.validator && !(await rule.validator(value))) {
            options.setStatus('error');
            invalidField = rule.field;
            success = false;
            continue;
         }
         options.setStatus('success');
      }
   }
   return { success, invalidField };
};

defineExpose({
   validate,
   validateAsync,
});
</script>

<template>
   <form>
      <slot></slot>
   </form>
</template>
