<script setup lang="ts">
import Color from 'color';
import type { DefineComponent } from 'vue';

const props = defineProps<{
   icon?: DefineComponent;
   tag: {
      name: string;
      color?: string | null;
      image?: { name: string } | null;
   };
   selected?: boolean;
}>();

const url = computed(() => {
   return `/api/static/${props.tag.image?.name}`;
});
const toggleColor = computed(() => {
   if (!props.tag.color) return '#6D6D6D';

   try {
      return Color(props.tag.color).hex();
   } catch {
      return '#6D6D6D';
   }
});
const textColorClass = computed(() => {
   return shouldUseBlackText(props.tag.color ?? '#fff')
      ? 'text-accent-700'
      : 'text-white';
});
</script>

<template>
   <StSpace
      gap="0.5rem"
      align="center"
      class="h-[3.5rem] px-6 rounded-full cursor-pointer border-transparent border hover:border-[var(--c)] shrink-0 text-nowrap whitespace-nowrap"
      :class="{
         'bg-accent-600 text-accent-100': !props.selected,
         'bg-accent-100 text-accent-600': props.selected,
         [textColorClass]: props.selected,
      }"
      :style="{
         '--c': props.tag.color ?? '#6D6D6D',
         backgroundColor:
            props.selected && props.tag.color ? toggleColor : undefined,
      }">
      <img
         v-if="tag.image?.name"
         :src="url"
         :alt="tag.name"
         :style="{
            filter: props.selected
               ? 'drop-shadow(1px 0 0 #111) drop-shadow(-1px 0 0 #111)\
                  drop-shadow(0 1px 0 #111) drop-shadow(0 -1px 0 #111)'
               : undefined,
         }"
         class="size-7 m-0.5"
         :class="{ 'bg-blend-multiply isolate': props.selected }" />
      <Component v-else-if="icon" size="1.5rem" :is="icon" />
      <span class="font-family-manrope font-bold"> {{ tag.name }}</span>
   </StSpace>
</template>
