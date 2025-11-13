import type { Ref, WatchSource } from 'vue';

export interface UseDynamicHeightOptions {
   /**
    * 内容区域的 ref
    */
   contentRef: Ref<HTMLElement | undefined>;

   /**
    * 需要监听的依赖项数组，当这些值变化时会重新计算高度
    */
   watchSources?: WatchSource[];

   /**
    * 底部固定区域的高度（如工具栏）
    */
   bottomFixedHeight?: number;

   /**
    * 最大容器高度
    */
   maxHeight?: number;

   /**
    * 初始容器高度
    */
   initialHeight?: number;

   /**
    * 额外的高度补偿值（用于微调）
    */
   extraPadding?: number;
}

/**
 * 动态高度管理 Composable
 *
 * 用于实现容器高度随内容变化而平滑过渡的效果
 *
 * @example
 * ```ts
 * const contentRef = ref<HTMLElement>();
 * const { containerHeight, BOTTOM_TOOLBAR_HEIGHT } = useDynamicHeight({
 *   contentRef,
 *   watchSources: [isLoading, data],
 *   bottomFixedHeight: 52,
 *   maxHeight: 600,
 * });
 * ```
 */
export function useDynamicHeight(options: UseDynamicHeightOptions) {
   const {
      contentRef,
      watchSources = [],
      bottomFixedHeight = 0,
      maxHeight = 600,
      initialHeight = 400,
      extraPadding = 0,
   } = options;

   // 容器动态高度
   const containerHeight = ref(initialHeight);

   // 更新容器高度的函数
   const updateHeight = () => {
      if (contentRef.value) {
         const contentHeight = contentRef.value.scrollHeight;
         // 计算总高度：内容高度 + 底部固定区域高度 + 额外补偿
         const totalHeight = contentHeight + bottomFixedHeight + extraPadding;
         // 限制最大高度
         containerHeight.value = Math.min(totalHeight, maxHeight);
      }
   };

   // 使用 ResizeObserver 监听内容区域尺寸变化
   let resizeObserver: ResizeObserver | null = null;

   onMounted(() => {
      if (contentRef.value) {
         resizeObserver = new ResizeObserver(() => {
            updateHeight();
         });
         resizeObserver.observe(contentRef.value);

         // 初始化时计算一次高度
         nextTick(() => {
            updateHeight();
         });
      }
   });

   onUnmounted(() => {
      if (resizeObserver) {
         resizeObserver.disconnect();
         resizeObserver = null;
      }
   });

   // 监听外部依赖变化，重新计算高度
   if (watchSources.length > 0) {
      watch(watchSources, () => {
         nextTick(() => {
            updateHeight();
         });
      });
   }

   return {
      /**
       * 容器的动态高度值（px）
       */
      containerHeight: readonly(containerHeight),

      /**
       * 底部固定区域高度（px）
       */
      BOTTOM_FIXED_HEIGHT: bottomFixedHeight,

      /**
       * 手动触发高度更新
       */
      updateHeight,
   };
}
