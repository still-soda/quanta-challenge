<script setup lang="ts">
import { Config } from '@icon-park/vue-next';

useSeoMeta({ title: '常规设置 - Quanta Challenge' });
</script>

<template>
   <StSpace direction="vertical" gap="1.5rem" fill-x>
      <!-- 标题区域 -->
      <StSpace gap="0.75rem" align="center">
         <Config class="text-2xl text-primary shrink-0" />
         <StSpace direction="vertical" gap="0.125rem">
            <h2 class="st-font-third-bold">常规设置</h2>
            <p class="text-xs text-accent-300">配置您的常规偏好和应用选项</p>
         </StSpace>
      </StSpace>

      <!-- 分割线 -->
      <div class="h-[1px] w-full bg-accent-500"></div>

      <!-- 内容区域 -->
      <div class="text-sm text-accent-300">常规设置功能即将推出...</div>
   </StSpace>
</template>
