<script setup lang="ts">
import type { IRule } from '~/components/st/Form/type';
import type { StForm } from '#components';
import { Box } from '@icon-park/vue-next';

const opened = defineModel<boolean>('opened', { default: false });

const emits = defineEmits(['created']);

const outerClass = 'border !py-4 !px-4 !rounded-[0.5rem] w-full';

const formdata = reactive({
   name: '',
   description: '',
   color: '#FA7C0E',
   imageId: '',
});

const rules: IRule[] = [
   {
      field: 'name',
      required: true,
      validator(value) {
         return !!value;
      },
   },
   {
      field: 'color',
      required: true,
      validator(value) {
         return !!value;
      },
   },
   {
      field: 'imageId',
      required: true,
      validator(value) {
         return !!value;
      },
   },
];
const form = useTemplateRef<InstanceType<typeof StForm>>('form');

const loading = ref(false);
const { $trpc } = useNuxtApp();
const handleCreate = async () => {
   if (!form.value?.validate().success) return;
   const createTag = async () => {
      $trpc.admin.tag.add.mutate({
         name: formdata.name,
         color: formdata.color,
         imageId: formdata.imageId,
         description: formdata.description,
      });
   };
   loading.value = true;
   await atLeastTime(200, createTag())
      .then(() => {
         formdata.name = '';
         formdata.description = '';
         formdata.color = '#FA7C0E';
         formdata.imageId = '';
         opened.value = false;
      })
      .catch((e) => {
         console.error(e);
      })
      .finally(() => {
         loading.value = false;
      });
   emits('created');
};

const enableSubmit = computed(() => {
   return form.value?.validate().success && !loading.value;
});
</script>

<template>
   <StDrawer global v-model:opened="opened" width="35rem">
      <StSpace direction="vertical" gap="0" fill class="text-white">
         <StSpace direction="vertical" gap="1.5rem" fill class="p-6">
            <!-- Header -->
            <h1 class="st-font-secondary-bold">新建标签</h1>
            <StSpace fill class="relative overflow-auto">
               <StForm
                  ref="form"
                  v-model:model-value="formdata"
                  :rules="rules"
                  class="w-full absolute top-0 left-0">
                  <StSpace direction="vertical" gap="1.5rem" fill-x>
                     <StFormItem name="tagName" label="标签名" required>
                        <StInput
                           v-model:value="formdata.name"
                           placeholder="请输入标签名"
                           :outer-class />
                     </StFormItem>
                     <StFormItem name="color" label="标签颜色" required>
                        <StColorPicker
                           v-model:value="formdata.color"
                           :outer-class />
                     </StFormItem>
                     <StFormItem name="imageId" label="标签图标" required>
                        <StUploadImage
                           v-model:image-id="formdata.imageId"
                           class="bg-black !max-h-[12rem]"
                           image-max-height="4rem"
                           placeholder="请选择标签图标" />
                     </StFormItem>
                     <StFormItem name="description" label="标签描述">
                        <StTextarea
                           v-model:value="formdata.description"
                           placeholder="请输入标签描述"
                           :outer-class />
                     </StFormItem>
                  </StSpace>
               </StForm>
            </StSpace>
         </StSpace>
         <!-- Bottom -->
         <StSpace justify="end" class="p-4 pt-0 w-full">
            <StButton
               @click="handleCreate"
               :loading="loading"
               :disabled="!enableSubmit"
               class="py-[0.375rem] px-[1.25rem] text-accent-100 !rounded-[0.375rem]">
               <div class="flex gap-2 items-center">
                  <Box class="text-[1.25rem]" />
                  <span>创建</span>
               </div>
            </StButton>
         </StSpace>
      </StSpace>
   </StDrawer>
</template>
