<script setup lang="ts">
defineProps<{
   count?: number;
}>();
</script>

<template>
   <tr v-for="i in count ?? 50" :key="i" class="text-left even:bg-accent-600">
      <td class="pl-6 pr-3 py-4 text-white rounded-l-lg text-center">
         <StSkeletonItem
            class="flex items-center justify-center font-bold size-[2.25rem] rounded-full text-sm font-family-manrope"
            :class="i % 2 === 1 ? 'bg-accent-600' : 'bg-accent-500'" />
      </td>
      <td class="pr-3 py-4 flex items-center gap-3">
         <StSkeletonItem
            class="size-9 rounded-lg"
            :class="i % 2 === 1 ? 'bg-accent-600' : 'bg-accent-500'" />
         <StSkeletonItem
            class="h-5 w-[12rem] rounded-md"
            :class="i % 2 === 1 ? 'bg-accent-600' : 'bg-accent-500'" />
      </td>
      <td class="pr-3 py-4 text-white text-left font-family-manrope font-bold">
         <StSkeletonItem
            class="h-5 w-[4.7rem] rounded-md"
            :class="i % 2 === 1 ? 'bg-accent-600' : 'bg-accent-500'" />
      </td>
      <td class="pr-3 py-4 text-white font-family-manrope">
         <StSkeletonItem
            class="h-5 w-[5rem] rounded-md"
            :class="i % 2 === 1 ? 'bg-accent-600' : 'bg-accent-500'" />
      </td>
      <td
         class="pr-6 py-4 text-white rounded-r-lg font-family-manrope text-center">
         <StSkeletonItem
            class="h-5 w-[5rem] rounded-md"
            :class="i % 2 === 1 ? 'bg-accent-600' : 'bg-accent-500'" />
      </td>
   </tr>
</template>
