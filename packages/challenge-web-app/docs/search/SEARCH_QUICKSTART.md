# 搜索功能快速开始指南

## 🎯 功能概述

搜索功能已完全实现前端部分，包括：
- ✅ 全屏搜索覆盖层
- ✅ 搜索输入框（带防抖）
- ✅ 搜索结果展示
- ✅ Cmd/Ctrl + K 快捷键
- ✅ 类型化的搜索结果系统
- ✅ 响应式设计

## 🚀 立即测试

1. **启动开发服务器**
   ```bash
   cd packages/app
   npm run dev  # 或 pnpm dev
   ```

2. **打开应用并测试**
   - 点击导航栏的"搜索"按钮
   - 或按 `Cmd + K` (Mac) / `Ctrl + K` (Windows/Linux)
   - 输入任意内容测试搜索界面

3. **当前状态**
   - 搜索框正常显示 ✅
   - 输入内容会触发搜索逻辑 ✅
   - 因为没有实现后端 API，搜索结果为空 ⚠️

## 📝 实现后端 API

### 步骤 1: 创建 API 文件

将示例文件重命名并实现：

```bash
cd packages/app/server/api
cp search.get.ts.example search.get.ts
```

### 步骤 2: 编辑 `search.get.ts`

根据你的数据库结构实现搜索逻辑。示例：

```typescript
import type { SearchResponse } from '~/types/search';

export default defineEventHandler(async (event): Promise<SearchResponse> => {
   const query = getQuery(event);
   const searchQuery = (query.q as string)?.trim();

   if (!searchQuery) {
      throw createError({
         statusCode: 400,
         message: '搜索关键词不能为空',
      });
   }

   // 使用 Prisma 查询数据库
   const problems = await prisma.problem.findMany({
      where: {
         title: { contains: searchQuery, mode: 'insensitive' }
      },
      take: 10
   });

   // 转换为搜索结果格式
   const results = problems.map(p => ({
      id: p.id,
      type: 'problem' as const,
      title: p.title,
      description: p.description?.substring(0, 100),
      url: `/challenge/${p.id}`,
      metadata: {
         difficulty: p.difficulty,
         tags: p.tags || [],
         solvedCount: p.solvedCount,
         acceptRate: p.acceptRate,
      }
   }));

   return {
      results,
      total: results.length,
      hasMore: false
   };
});
```

### 步骤 3: 更新 useSearch

如果需要，可以启用真实的 API 调用。在 `composables/use-search.ts` 中：

```typescript
const performSearch = async (query: string) => {
   if (!query.trim()) {
      searchResults.value = [];
      return;
   }

   isSearching.value = true;
   searchQuery.value = query;

   try {
      // 取消注释以下代码启用真实 API
      const response = await $fetch<SearchResponse>('/api/search', {
         query: { q: query, type: 'all', limit: 20 }
      });
      searchResults.value = response.results;
   } catch (error) {
      console.error('搜索失败:', error);
      searchResults.value = [];
   } finally {
      isSearching.value = false;
   }
};
```

## 🧪 测试 API

创建后端 API 后，重新启动开发服务器并测试：

1. 打开搜索框（Cmd/Ctrl + K）
2. 输入搜索关键词
3. 应该能看到搜索结果

## 📚 更多信息

- 完整实现文档：`SEARCH_IMPLEMENTATION.md`
- 类型定义：`app/types/search.ts`
- 核心组件：`app/components/st/SearchOverlay/`
- 状态管理：`app/composables/use-search.ts`

## 🐛 故障排除

### 问题：搜索框不显示

- 检查浏览器控制台是否有错误
- 确保 `StSearchOverlay` 组件已在 `app-layout.vue` 中引入

### 问题：快捷键不工作

- 确保没有其他插件或扩展占用了 Cmd/Ctrl + K
- 检查浏览器控制台是否有快捷键冲突

### 问题：搜索没有结果

- 检查后端 API 是否正确实现
- 在浏览器开发者工具中查看网络请求
- 确认数据库中有匹配的数据

## ✨ 下一步增强

1. **搜索类型过滤**：添加题目/用户/标签筛选
2. **键盘导航**：使用方向键选择结果
3. **搜索历史**：记录和显示搜索历史
4. **热门搜索**：显示热门搜索词建议
5. **高级搜索**：支持更复杂的搜索条件
