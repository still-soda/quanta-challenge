<script setup lang="ts">
import { Message } from '@icon-park/vue-next';
import Section from './_components/Section.vue';
import Binary from './_components/Binary.vue';

useSeoMeta({ title: '常规设置 - Quanta Challenge' });

const notifications = ref({
   email: true,
   browser: false,
});
</script>

<template>
   <StSpace fill-x direction="vertical" gap="1rem">
      <Section
         title="通知设置"
         desc="管理您接收通知的方式和内容，不错过重要信息。"
         :icon="Message">
         <Binary v-model="notifications.email">接收重要通知邮件</Binary>
         <Binary v-model="notifications.browser">浏览器推送通知</Binary>
      </Section>
   </StSpace>
</template>
