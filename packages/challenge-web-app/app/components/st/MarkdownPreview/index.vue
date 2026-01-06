<script setup lang="ts">
const props = defineProps<{
   html?: string;
}>();
</script>

<template>
   <div v-html="props.html" class="markdown-body"></div>
</template>

<style src="./style.css" />
