# 搜索功能实现文档

## 概述

全局搜索功能已实现，包含：
- 搜索覆盖层（StSearchOverlay）
- 搜索状态管理（useSearch composable）
- 键盘快捷键支持（Cmd/Ctrl + K）

## 组件结构

### 1. StSearchOverlay
位置：`packages/app/app/components/st/SearchOverlay/index.vue`

这是搜索界面的主组件，包含：
- 搜索输入框
- 搜索结果展示区
- 加载状态
- 空状态提示
- 键盘快捷键提示

### 2. useSearch Composable
位置：`packages/app/app/composables/use-search.ts`

提供以下功能：

```typescript
const {
  isSearchOpen,      // 搜索框是否打开
  openSearch,        // 打开搜索框
  closeSearch,       // 关闭搜索框
  toggleSearch,      // 切换搜索框状态
  searchQuery,       // 当前搜索关键词
  searchResults,     // 搜索结果数组
  isSearching,       // 是否正在搜索
  performSearch,     // 执行搜索方法
} = useSearch();
```

## 使用方式

### 触发搜索

1. **通过导航栏按钮**：点击导航栏的"搜索"按钮
2. **通过快捷键**：按下 `Cmd + K`（Mac）或 `Ctrl + K`（Windows/Linux）

### 关闭搜索

1. 按 `ESC` 键
2. 点击背景遮罩区域

## 待实现的搜索 API

在 `useSearch` composable 的 `performSearch` 方法中，需要实现实际的搜索逻辑：

```typescript
const performSearch = async (query: string) => {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  searchQuery.value = query;

  try {
    // TODO: 替换为实际的搜索 API 调用
    // 示例：
    const results = await $fetch('/api/search', { 
      query: { 
        q: query,
        type: 'all', // 或者 'problem', 'user', 'tag' 等
        limit: 20
      } 
    });
    searchResults.value = results;
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};
```

## 搜索结果数据结构

建议的搜索结果格式：

```typescript
interface SearchResult {
  id: string;
  type: 'problem' | 'user' | 'tag' | 'announcement';
  title: string;
  description?: string;
  url?: string;
  metadata?: {
    // 根据类型添加额外信息
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    avatar?: string;
    // ...
  };
}
```

## 自定义搜索结果展示

在 `StSearchOverlay/index.vue` 中，找到搜索结果列表部分：

```vue
<!-- 搜索结果列表 -->
<div v-else class="divide-y divide-accent-500">
  <div
    v-for="(result, index) in searchResults"
    :key="index"
    class="px-6 py-4 hover:bg-accent-600 transition-colors cursor-pointer">
    <!-- TODO: 根据结果类型展示不同的内容 -->
    <div class="text-white st-font-body-bold">
      {{ result.title }}
    </div>
    <div class="text-accent-300 text-sm mt-1">
      {{ result.description }}
    </div>
  </div>
</div>
```

可以根据 `result.type` 展示不同的卡片样式。

## 样式说明

- 覆盖层 z-index: `9999`（在 Message 组件的 `10000` 之下）
- 背景：半透明黑色 + 模糊效果
- 搜索框：深色主题，带边框和阴影
- 响应式：最大宽度 42rem，适配各种屏幕尺寸

## 键盘导航（预留）

底部提示栏显示了键盘操作提示：
- `↑` `↓`：选择搜索结果（待实现）
- `Enter`：打开选中的结果（待实现）
- `ESC`：关闭搜索框（已实现）

如需实现键盘导航，可以在 `StSearchOverlay` 中添加：

```typescript
const selectedIndex = ref(0);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeSearch();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = Math.min(
      selectedIndex.value + 1, 
      searchResults.value.length - 1
    );
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    // 打开选中的结果
    const selected = searchResults.value[selectedIndex.value];
    if (selected?.url) {
      navigateTo(selected.url);
      closeSearch();
    }
  }
};
```

## 性能优化

- 已实现搜索防抖（300ms），避免频繁请求
- 关闭搜索框时自动清空搜索状态
- 输入框自动聚焦

## 下一步

1. 实现后端搜索 API（`/api/search`）
2. 根据实际数据结构调整搜索结果展示
3. 实现键盘导航功能
4. 添加搜索历史记录
5. 添加热门搜索建议
