<script setup lang="ts">
import type { DefineComponent } from 'vue';

const props = defineProps<{
   options: { label: string; value: string; icon?: DefineComponent }[];
}>();

const value = defineModel<string>();
const tabWidths = ref<number[]>([]);

onMounted(() => {
   requestAnimationFrame(() => {
      value.value = props.options[0]?.value;
   });
});

const currentIndex = computed(() => {
   return props?.options.findIndex((opt) => opt.value === value.value) ?? 0;
});
const currentLeft = computed(() => {
   return tabWidths.value
      .slice(0, currentIndex.value)
      .reduce((a, b) => a + b, 0);
});
const currentWidth = computed(() => {
   return tabWidths.value[currentIndex.value] ?? 0;
});

const tabs = useTemplateRefsList<{ $el: HTMLElement }>();
onMounted(() => {
   tabWidths.value = tabs.value.map(
      (tab) => tab.$el.getBoundingClientRect().width,
   );
});
</script>

<template>
   <StSpace fill-x class="relative border-b border-b-accent-500" gap="0">
      <div
         class="absolute bg-primary bottom-0 left-0 h-[1px] translate-y-[1px] transition-all"
         :style="{
            left: `${currentLeft}px`,
            width: `${currentWidth}px`,
         }"></div>
      <StSpace
         v-for="tab in props.options"
         :key="tab.value"
         :ref="tabs.set"
         :class="{
            'text-accent-300': tab.value !== value,
            'text-primary': tab.value === value,
         }"
         class="px-6 py-2 cursor-pointer transition-all"
         align="center"
         @click="value = tab.value">
         <Component v-if="tab.icon" :is="tab.icon" class="text-lg mr-2" />
         {{ tab.label }}
      </StSpace>
   </StSpace>
</template>
