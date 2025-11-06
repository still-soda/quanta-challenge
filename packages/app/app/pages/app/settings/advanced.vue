<script setup lang="ts">
import { ApplicationMenu } from '@icon-park/vue-next';

useSeoMeta({ title: '高级设置 - Quanta Challenge' });
</script>

<template>
   <StSpace direction="vertical" gap="1.5rem" fill-x>
      <!-- 标题区域 -->
      <StSpace gap="0.75rem" align="center">
         <ApplicationMenu class="text-2xl text-primary shrink-0" />
         <StSpace direction="vertical" gap="0.125rem">
            <h2 class="st-font-third-bold">高级设置</h2>
            <p class="text-xs text-accent-300">配置高级选项和实验性功能</p>
         </StSpace>
      </StSpace>

      <!-- 分割线 -->
      <div class="h-[1px] w-full bg-accent-500"></div>

      <!-- 内容区域 -->
      <div class="text-sm text-accent-300">高级设置功能即将推出...</div>
   </StSpace>
</template>
