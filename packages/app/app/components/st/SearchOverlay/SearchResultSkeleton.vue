<script setup lang="ts">
// 搜索结果骨架屏组件
</script>

<template>
   <div class="px-4 py-2.5">
      <StSpace gap="0.75rem" align="center" fill-x>
         <!-- 图标骨架 -->
         <StSkeletonItem class="size-[2.5rem] rounded-full shrink-0" />

         <!-- 内容区域骨架 -->
         <StSpace direction="vertical" gap="0.25rem" fill-x class="min-w-0">
            <!-- 标题行骨架 -->
            <StSpace gap="0.5rem" align="center" fill-x no-wrap>
               <!-- 标题骨架 -->
               <StSkeletonItem class="h-5 flex-1" />

               <!-- 标签组骨架 -->
               <StSpace gap="0.25rem" align="center" no-wrap class="shrink-0">
                  <StSkeletonItem class="h-5 w-10" />
                  <StSkeletonItem class="h-5 w-10" />
               </StSpace>
            </StSpace>

            <!-- 元数据行骨架 -->
            <StSpace gap="0.75rem" align="center">
               <StSkeletonItem class="h-4 w-12" />
               <StSkeletonItem class="h-4 w-16" />
               <StSkeletonItem class="h-4 w-20" />
            </StSpace>
         </StSpace>
      </StSpace>
   </div>
</template>
