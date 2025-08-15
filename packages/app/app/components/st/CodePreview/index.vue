<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { useShiki } from '~/composables/utils/use-shiki';
import langVue from 'shiki/langs/vue.mjs';
import langTsx from 'shiki/langs/tsx.mjs';
import langJsx from 'shiki/langs/jsx.mjs';

const props = defineProps<{
   code: string;
   language?: string;
}>();

const emits = defineEmits(['ready']);

const { highlightHtml, highlightCode, onReady } = useShiki({
   languages: [langVue, langTsx, langJsx],
});
onReady(() => emits('ready'));

const debouncedHighlightCode = useDebounceFn(highlightCode, 50);
watch(
   () => props.code,
   (code) => debouncedHighlightCode(code, props.language),
   { immediate: true }
);
</script>

<template>
   <div class="!font-family-fira-code">
      <div v-if="highlightHtml" v-html="highlightHtml" class="code"></div>
      <div v-else class="code text-accent-200">
         <pre>{{ props.code }}</pre>
      </div>
   </div>
</template>

<style lang="css" scoped>
.code :deep(.shiki) {
   background: transparent !important;
}

.code * {
   font-family: 'FiraCode Nerd Font Mono', 'monospace' !important;
   font-variant-ligatures: none !important;
}
</style>
