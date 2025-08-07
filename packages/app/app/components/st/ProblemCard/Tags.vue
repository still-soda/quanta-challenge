<script setup lang="ts">
defineProps<{
   tags: {
      color?: string | null;
      name: string;
   }[];
}>();
</script>

<template>
   <StSpace align="center" gap="0.5rem" class="w-full">
      <div class="text-accent-200">标签</div>
      <StSpace gap="0.375rem" class="!font-family-manrope">
         <StTag
            v-for="tag in tags.slice(0, 1)"
            size="small"
            :key="tag.name"
            :color="tag.color ?? void 0"
            :content="tag.name" />
         <StTag
            v-if="tags.length > 1"
            size="small"
            color="#6D6D6D"
            :content="`+${tags.length - 1}`" />
      </StSpace>
   </StSpace>
</template>
