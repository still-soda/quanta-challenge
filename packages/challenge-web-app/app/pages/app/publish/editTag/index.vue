<script setup lang="ts">
import {  ref, computed, onMounted } from 'vue';
import type { ISelectOption } from '~/components/st/Select/type';
import TagEditingDrawer from '../problem/_drawers/TagEditingDrawer.vue'
import { ExpandDown, FoldUpOne, Box, Plus } from '@icon-park/vue-next';
const { $trpc } = useNuxtApp();

const tagOptions = ref<(ISelectOption & { color: string })[]>([]);
const isExpanded = ref(false);
const MAX_VISIBLE_TAGS = 5;

const fetchTags = async (): Promise<(ISelectOption & { color: string })[]> => {
    const rawTags = await $trpc.public.tag.list.query();
    // 加工数据
    const formattedTags = rawTags.map((tag) => ({
        label: tag.name,
        value: tag.tid,
        color: tag.color ?? '#FA7C0E',
        imageUrl: tag.url ? `http://localhost:3000${tag.url}` : undefined,
    })).toSorted((a, b) =>
        a.label.localeCompare(b.label)
    );

    tagOptions.value = formattedTags;
    return formattedTags;
};

onMounted(() => {
    fetchTags();
});

const isDrawerShow = ref(false);
const handleCreated = () => {
    console.log('新标签创建成功，准备刷新列表');
    fetchTags()
};

const deleteTag = async (tid: number) => {
    if (!confirm('确定要删除这个标签吗?')) return;
    try {
        await $trpc.public.tag.deleteTag.mutate(tid);
        await fetchTags();
        console.log("删除成功");

    } catch (error) {
        console.error("删除失败", error);
        alert('删除失败')
    }
}

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};

const visibleTags = computed(() => {
    if (isExpanded.value) {
        return tagOptions.value;
    }
    return tagOptions.value.slice(0, MAX_VISIBLE_TAGS);
});
</script>

<template>
    <StSpace fill justify="center" class="bg-[#111111] min-h-screen overflow-auto">
        <StSpace direction="vertical" gap="1.5rem" class="w-[44rem] pb-[10rem] my-6">
            <div class="flex items-end gap-4 mb-2">
                <h1 class="st-font-hero-bold text-accent-100">标签管理</h1>
                <span class="st-font-caption text-accent-300 bg-accent-600 px-3 py-1 my-2 rounded-full">
                    共 {{ tagOptions.length }} 个标签
                </span>
            </div>

            <StSpace direction="vertical" gap="1.75rem" class="w-full px-[0.625rem]">
                <div class="flex flex-col gap-3 w-full">
                    <div v-for="tag in visibleTags" :key="tag.value"
                        class="group flex items-center justify-between p-4 bg-accent-600 border border-accent-500 rounded-[0.75rem] hover:border-primary/50 transition-all duration-300">
                        <StSpace align="center" gap="1.25rem">
                            <div
                                class="w-12 h-12 flex items-center justify-center bg-accent-700 rounded-[0.5rem] border border-accent-500 overflow-hidden">
                                <img v-if="tag.imageUrl" class="w-8 h-8 object-contain" :src="tag.imageUrl"
                                    alt="tag-icon">
                                <Box v-else class="text-accent-400 text-2xl" />
                            </div>

                            <StSpace direction="vertical" gap="0.25rem">
                                <h3 class="st-font-third-bold text-accent-100">{{ tag.label }}</h3>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full border border-white/10"
                                        :style="{ backgroundColor: tag.color }"></div>
                                    <span class="st-font-tooltip text-accent-300 font-mono">{{ tag.color }}</span>
                                </div>
                            </StSpace>
                        </StSpace>

                        <div class="flex gap-2">
                            <StButton theme="danger" size="sm" bordered
                                class="!px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                @click="deleteTag(tag.value as number)">删除
                            </StButton>
                        </div>
                    </div>

                    <div v-if="tagOptions.length > MAX_VISIBLE_TAGS" class="flex justify-center mt-4">
                        <button 
                            @click="toggleExpand"
                            class="flex items-center justify-center gap-2 px-4 py-2 bg-accent-600 border border-accent-500 rounded-[0.5rem] text-accent-300 st-font-caption hover:bg-accent-500 transition-all duration-300 active:scale-95"
                        >
                            <ExpandDown v-if="!isExpanded" class="text-accent-300 w-4 h-4 transition-transform duration-300" />
                            <FoldUpOne v-else class="text-accent-300 w-4 h-4 transition-transform duration-300 rotate-180" />
                            <span>{{ isExpanded ? '收起' : `查看全部 ${tagOptions.length} 个标签` }}</span>
                        </button>
                    </div>
                </div>

                <div v-if="tagOptions.length === 0"
                    class="py-20 bg-accent-600/30 rounded-[1rem] border border-dashed border-accent-500">
                    <StEmptyStatus content="暂无标签，点击下方按钮开始创建" />
                </div>

                <div class="pt-6 border-t border-accent-500 w-full flex justify-center">
                    <StButton theme="primary" class="w-full h-14 !rounded-[0.75rem] group" @click="isDrawerShow = true">
                        <div class="flex items-center justify-center gap-2 st-font-third-bold">
                            <Plus class="group-hover:rotate-90 transition-transform" />
                            <span>新建系统标签</span>
                        </div>
                    </StButton>
                </div>

                <TagEditingDrawer v-model:opened="isDrawerShow" @created="handleCreated" />
            </StSpace>
        </StSpace>
    </StSpace>
</template>

<style scoped>
/* 针对该页面微调滚动条（根据规范隐藏默认滚动条） */
.overflow-auto::-webkit-scrollbar {
    display: none;
}

.overflow-auto {
    scrollbar-width: none;
}
</style>