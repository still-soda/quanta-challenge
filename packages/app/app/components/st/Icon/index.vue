<script setup lang="ts">
import * as Icons from '@icon-park/vue-next';

defineProps<{
   name: keyof typeof Icons;
   size?: string | number;
   strokeWidth?: string | number;
}>();
</script>

<template>
   <component :is="Icons[name]" :size="size" :stroke-width="strokeWidth" />
</template>
