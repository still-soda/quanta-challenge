<script setup lang="ts">
import {
   assignFormItemKey,
   type FormItemStatus,
   type IAssignFormItemOptions,
} from './type';

const props = defineProps<{
   name: string;
   errorMessage?: string;
   successMessage?: string;
}>();

const assignMethod = inject<(options: IAssignFormItemOptions) => void>(
   assignFormItemKey,
   () => void 0
);

const status = ref<FormItemStatus>('default');

onMounted(() => {
   assignMethod({
      name: props.name,
      setStatus: (s) => (status.value = s),
   });
});
</script>

<template>
   <div class="flex flex-col gap-2 w-full">
      <slot v-bind="$attrs" :status="status"></slot>
      <div
         v-if="errorMessage && status === 'error'"
         class="text-error text-xs ml-2 st-shaking"
         :class="{ 'mt-2': $slots.prefix }">
         {{ errorMessage }}
      </div>
      <div
         v-if="successMessage && status === 'success'"
         class="text-success text-xs ml-2 st-shaking"
         :class="{ 'mt-2': $slots.prefix }">
         {{ successMessage }}
      </div>
   </div>
</template>

<style lang="css" scoped>
@keyframes shaking {
   0% {
      transform: translateX(0) scaleY(0);
   }
   25% {
      transform: translateX(-5px) scaleY(1);
   }
   50% {
      transform: translateX(5px);
   }
   75% {
      transform: translateX(-5px);
   }
   100% {
      transform: translateX(0);
   }
}

.st-shaking {
   animation: shaking 0.3s ease-in-out;
}
</style>
