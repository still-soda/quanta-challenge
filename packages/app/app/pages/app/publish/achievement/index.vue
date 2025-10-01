<script setup lang="ts">
import { GoldMedalTwo } from '@icon-park/vue-next';
import { useAchievementPublicationForm } from './_composables/use-achievement-publication-form';
import DependencyDataPicker from './_modules/DependencyDataPicker.vue';

useSeoMeta({ title: '创建成就 - Quanta Challenge' });

const outerClass = 'border !py-4 !px-4 !rounded-[0.5rem] w-full';

const { form, formKey, formdata, rules } = useAchievementPublicationForm();
</script>

<template>
   <StSpace fill justify="center" class="overflow-auto">
      <StSpace
         direction="vertical"
         gap="1.5rem"
         class="w-[44rem] pb-[10rem] my-6">
         <h1 class="st-font-hero-bold">创建成就</h1>
         <StForm
            v-model:model-value="formdata"
            ref="formKey"
            :rules="rules"
            class="w-full">
            <StSpace
               direction="vertical"
               gap="1.75rem"
               class="w-full px-[0.625rem]">
               <StFormItem name="title" label="成就名称" required>
                  <StInput
                     v-model:value="formdata.name"
                     placeholder="请输入2～15字的成就名称"
                     name="title"
                     :outer-class />
               </StFormItem>
               <StFormItem name="description" label="成就描述" required>
                  <StInput
                     v-model:value="formdata.description"
                     placeholder="请输入1～20字的成就描述"
                     name="description"
                     :outer-class />
               </StFormItem>
               <StFormItem name="icon" label="成就图标" required>
                  <StUploadImage
                     v-model:image-id="formdata.imageId"
                     :icon="GoldMedalTwo"
                     placeholder="请上传成就徽章图片" />
               </StFormItem>
               <StFormItem name="requiredData" label="成就依赖数据" required>
                  <DependencyDataPicker
                     v-model:value="formdata.dependencyData"
                     :outer-class />
               </StFormItem>
            </StSpace>
         </StForm>
      </StSpace>
   </StSpace>
</template>
