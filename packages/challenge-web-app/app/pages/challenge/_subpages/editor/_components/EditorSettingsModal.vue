<script setup lang="ts">
import { type EditorConfig } from '../_configs';
import { Close } from '@icon-park/vue-next';

const props = defineProps<{
   config: EditorConfig;
}>();

const emit = defineEmits<{
   'update:config': [config: EditorConfig];
}>();

const opened = defineModel<boolean>('opened', {
   default: false,
});

// 本地配置副本
const localConfig = reactive<EditorConfig>({
   fontSize: props.config.fontSize,
});

// 监听外部配置变化
watch(
   () => props.config,
   (newConfig) => {
      localConfig.fontSize = newConfig.fontSize;
   },
   { deep: true }
);

// 监听本地配置变化，实时更新
watch(
   localConfig,
   (newConfig) => {
      emit('update:config', { ...newConfig });
   },
   { deep: true }
);
</script>

<template>
   <StModal v-model:opened="opened">
      <StSpace
         direction="vertical"
         gap="1.5rem"
         class="bg-accent-600 rounded-xl p-6 min-w-[400px] max-w-[500px] border border-accent-500 text-white">
         <!-- 标题 -->
         <StSpace justify="between" align="center" fill-x>
            <h2 class="text-xl font-semibold text-accent-50">编辑器设置</h2>
            <button
               class="text-accent-200 hover:text-accent-50 transition-colors cursor-pointer"
               @click="opened = false">
               <Close />
            </button>
         </StSpace>

         <!-- 配置项 -->
         <StSpace direction="vertical" gap="1rem" fill-x>
            <!-- 字体大小 -->
            <StSpace direction="vertical" gap="0.5rem" fill-x>
               <label
                  for="font-size-input-modal"
                  class="text-accent-100 st-font-caption">
                  字体大小
               </label>
               <StSpace gap="0.5rem" align="center" fill-x>
                  <StInput
                     id="font-size-input-modal"
                     v-model:value.number="localConfig.fontSize"
                     type="number"
                     min="10"
                     max="32"
                     step="1"
                     :placeholder="`${props.config.fontSize}`"
                     class="flex-1 !pl-2 !py-1 bg-accent-500 text-accent-100 rounded-md border border-accent-400 transition-all" />
               </StSpace>
               <div class="text-accent-300 st-font-tooltip">
                  建议范围：10-32px
               </div>
            </StSpace>

            <!-- 可以在这里添加更多配置项 -->
         </StSpace>
      </StSpace>
   </StModal>
</template>
