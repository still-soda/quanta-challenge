<script setup lang="ts">
import { createHighlighter, type Highlighter } from 'shiki';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps<{
   code: string;
   language?: string;
}>();

const highlighter = ref<Highlighter>();
const hasReady = ref(false);

const emits = defineEmits(['ready']);

const init = async () => {
   try {
      highlighter.value = await createHighlighter({
         themes: ['github-dark'],
         langs: ['typescript', 'javascript', 'vue', 'html', 'css'],
      });
      hasReady.value = true;
   } catch (error) {
      console.error('Failed to initialize highlighter:', error);
   }
};
init();

const highlightHtml = ref('');
const rehighlightCode = async () => {
   if (!hasReady.value) return;
   if (!highlighter.value) {
      await init();
      if (!highlighter.value) return;
   }
   highlightHtml.value = highlighter.value.codeToHtml(props.code, {
      lang: props.language || 'typescript',
      theme: 'github-dark',
   });
   emits('ready');
};

onUnmounted(() => {
   highlighter.value?.dispose();
   highlighter.value = void 0;
});

const debouncedRehighlight = useDebounceFn(rehighlightCode, 300);
watch(
   () => props.code,
   () => debouncedRehighlight(),
   { immediate: true }
);
</script>

<template>
   <div class="!font-family-fira-code">
      <div v-html="highlightHtml" class="code"></div>
   </div>
</template>

<style lang="css" scoped>
.code >>> .shiki {
   background: transparent !important;
}
</style>
