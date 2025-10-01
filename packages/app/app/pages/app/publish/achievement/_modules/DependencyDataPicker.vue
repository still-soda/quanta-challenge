<script setup lang="ts">
import type { ISelectOption } from '~/components/st/Select/type';
import { Plus, RobotOne } from '@icon-park/vue-next';
import DepDataRequestDrawer from '../_drawers/DepDataRequestDrawer.vue';

const { $trpc } = useNuxtApp();

const dependencyData = defineModel<number[]>('dependencyData', { default: [] });

const props = defineProps<{
   outerClass?: string;
}>();

const dependencyOptions = ref<ISelectOption[]>([]);
const tagValueToLabel = (value: string) => {
   const option = dependencyOptions.value.find(
      (option) => option.value === value
   );
   return option ? option.label : value;
};

const handleRemoveTag = (tag: number) => {
   dependencyData.value = dependencyData.value.filter((t) => t !== tag);
};

const tagSelectOpened = ref(false);
const fetchTagLoading = ref(false);
const fetchTags = async (): Promise<ISelectOption[]> => {
   const deps = await $trpc.admin.achievement.getAllDepDataLoaders.query();
   return deps
      .map((dep) => ({
         label: dep.name,
         value: dep.id,
         description: dep.description ?? '',
      }))
      .toSorted((a, b) =>
         a.label.localeCompare(b.label)
      ) satisfies ISelectOption[];
};

onMounted(async () => {
   if (dependencyData.value.length > 0) {
      dependencyOptions.value = await fetchTags();
   }
});

watch(tagSelectOpened, async (opened) => {
   if (!opened || dependencyOptions.value.length > 0) return;
   fetchTagLoading.value = true;
   dependencyOptions.value = await atLeastTime(400, fetchTags());
   fetchTagLoading.value = false;
});

const depDataCreating = ref(false);

const onSubmitDepDataRequest = async () => {
   depDataCreating.value = false;
   tagSelectOpened.value = true;
   dependencyOptions.value = await fetchTags();
};
</script>

<template>
   <DepDataRequestDrawer
      v-model:opened="depDataCreating"
      @submit="onSubmitDepDataRequest"
      :outer-class />
   <StSelect
      v-model:value="dependencyData"
      v-model:opened="tagSelectOpened"
      attach-to-body
      placeholder="请选择依赖数据"
      multiple
      :loading="fetchTagLoading"
      :outer-class="props.outerClass"
      :options="dependencyOptions">
      <template #options-empty>
         <div
            class="w-fit mx-auto flex justify-center text-sm text-accent-300 h-10 items-center relative">
            <RobotOne class="text-base absolute -left-5" />
            <StSpace no-wrap no-shrink gap="0">
               还没有任何数据，
               <div
                  @click="depDataCreating = !depDataCreating"
                  :class="[
                     'st-font-caption text-primary underline underline-offset-3',
                     'cursor-pointer hover:opacity-75 transition-opacity',
                  ]">
                  去申请
               </div>
            </StSpace>
         </div>
      </template>
      <template #selected-preview="{ value }">
         <div class="flex gap-2 flex-wrap w-full">
            <StTag
               v-for="tag in value"
               closable
               :key="tag"
               :content="tagValueToLabel(tag)"
               color="#fa7c0e"
               @click.stop
               @close="handleRemoveTag(tag)" />
         </div>
      </template>
      <template #option-label="{ item }">
         <span class="font-family-fira-code">{{ item.label }}</span>
      </template>
      <template #options-after>
         <div class="flex justify-center border-t border-accent-600 w-full">
            <div
               class="mx-auto flex justify-center text-sm text-accent-300 h-8 pt-1 items-center relative">
               <StSpace
                  no-wrap
                  no-shrink
                  gap="0"
                  align="center"
                  @click="depDataCreating = !depDataCreating"
                  :class="[
                     'st-font-caption text-primary',
                     'cursor-pointer hover:opacity-75 transition-opacity',
                  ]">
                  <Plus class="text-base absolute -left-5" />
                  申请新数据
               </StSpace>
            </div>
         </div>
      </template>
   </StSelect>
</template>
