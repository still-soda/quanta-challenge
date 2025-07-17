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

const formdata = defineModel<Record<string, string>>({
   default: () => ({}),
});
const props = defineProps<{
   rules?: IRule[];
}>();

const validate = () => {
   const rules = props.rules || [];
   const formdataKeySet = new Set(Object.keys(formdata.value));
   const rulesToValidate = rules.filter((rule) => {
      const options = optionsMap.get(rule.name);
      return options && formdataKeySet.has(rule.name);
   });
   let success = true;
   for (const rule of rulesToValidate) {
      const options = optionsMap.get(rule.name);
      if (options) {
         const value = formdata.value[rule.name];
         if (rule.required && !value) {
            console.error(`Field ${rule.name} is required`);
            options.setStatus('error');
            success = false;
            continue;
         }
         if (rule.validator && !rule.validator(value)) {
            console.error(`Field ${rule.name} validation failed`);
            options.setStatus('error');
            success = false;
            continue;
         }
         options.setStatus('success');
      }
   }
   return success;
};

defineExpose({
   validate,
});
</script>

<template>
   <form>
      <slot></slot>
   </form>
</template>
