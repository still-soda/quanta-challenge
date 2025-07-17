<script setup lang="ts">
import * as Icons from '@icon-park/vue-next';

defineProps<{
   name: keyof typeof Icons;
}>();
</script>

<template>
   <component :is="Icons[name]" />
</template>
