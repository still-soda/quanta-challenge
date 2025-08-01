<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
   placeholder?: string;
}>();

const imageUrl = ref('');
const imageFile = ref<File | null>(null);

watch(imageFile, (newFile) => {
   if (newFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
         imageUrl.value = e.target?.result as string;
      };
      reader.readAsDataURL(newFile);
   } else {
      imageUrl.value = '';
   }
});

const cleanup = () => {
   imageFile.value = null;
   imageUrl.value = '';
};
</script>

<template>
   <div
      :class="[
         'border border-accent-300 rounded-lg overflow-hidden',
         !imageUrl ? 'h-[10.6rem]' : 'h-[19rem]',
         [
            'bg-background',
            !imageUrl && 'hover:bg-accent-600/50 hover:cursor-pointer',
         ],
         'transition-colors',
         'flex items-center justify-center',
      ]">
      <StDropUploader
         v-if="!imageUrl"
         :placeholder="props.placeholder"
         icon="ImageFiles"
         type="file"
         accept="image/*"
         @update:files="imageFile = $event?.[0] || null" />
      <StSpace v-else direction="vertical" center gap="0.75rem">
         <img
            :src="imageUrl"
            class="max-h-[14rem] object-cover rounded-lg"
            alt="Uploaded Image" />
         <div class="relative flex flex-col">
            <div class="st-font-caption text-white">
               {{ imageFile?.name }}
            </div>
            <StSpace
               @click="cleanup"
               center
               class="text-error size-5 rounded-md hover:bg-error/30 hover:cursor-pointer transition-all absolute -right-7 mt-0.5">
               <StIcon name="DeleteFour" size="0.75rem" />
            </StSpace>
         </div>
      </StSpace>
   </div>
</template>
