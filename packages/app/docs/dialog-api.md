# Dialog API 使用指南

自定义对话框系统，替代原生的 `alert`、`confirm` 和 `prompt`。

## 特性

- ✅ **离线 API** - 无需依赖 Vue setup 上下文，可在任何地方使用
- ✅ **SSR 友好** - 服务端渲染时自动降级，返回合理的默认值
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **易用性** - 简洁的 API 设计，符合直觉
- ✅ **可定制** - 支持自定义内容、按钮、验证器等
- ✅ **视觉一致性** - 与应用整体设计保持一致

## API 文档

### `dialog.confirm(options)`

显示确认对话框。

**参数：**

```typescript
interface ConfirmDialogOptions {
   title?: string;              // 标题
   description?: string;        // 描述文本
   content?: Component;         // 自定义内容组件
   confirmText?: string;        // 确认按钮文本，默认 "确定"
   cancelText?: string;         // 取消按钮文本，默认 "取消"
   variant?: 'default' | 'danger';  // 样式变体
   cancelable?: boolean;        // 是否可取消，默认 true
   onConfirm?: () => void | Promise<void>;  // 确认回调
   onCancel?: () => void;       // 取消回调
}
```

**返回值：** `Promise<boolean>` - `true` 表示确认，`false` 表示取消

**示例：**

```typescript
import { dialog } from '~/composables/use-dialog';

// 基本用法
const confirmed = await dialog.confirm({
   title: '删除确认',
   description: '确定要删除这个文件吗？此操作无法撤销。',
});

if (confirmed) {
   // 执行删除操作
}

// 危险操作
const result = await dialog.confirm({
   title: '永久删除',
   description: '这将永久删除所有数据，无法恢复！',
   variant: 'danger',
   confirmText: '删除',
   cancelText: '取消',
});
```

---

### `dialog.prompt(options)`

显示输入对话框。

**参数：**

```typescript
interface PromptDialogOptions {
   title?: string;
   description?: string;
   placeholder?: string;        // 输入框占位符
   defaultValue?: string;       // 默认值
   inputType?: 'text' | 'password';  // 输入类型
   validator?: (value: string) => boolean | string;  // 验证器
   confirmText?: string;
   cancelText?: string;
   onConfirm?: (value: string) => void | Promise<void>;
}
```

**返回值：** `Promise<string | null>` - 用户输入的值，取消返回 `null`

**示例：**

```typescript
// 基本用法
const filename = await dialog.prompt({
   title: '新建文件',
   placeholder: '请输入文件名',
   defaultValue: 'index.html',
});

if (filename) {
   // 创建文件
}

// 带验证器
const username = await dialog.prompt({
   title: '设置用户名',
   placeholder: '请输入用户名',
   validator: (value) => {
      if (value.length < 3) {
         return '用户名至少需要 3 个字符';
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
         return '用户名只能包含字母、数字和下划线';
      }
      return true;
   },
});
```

---

### `dialog.alert(options)`

显示警告/通知对话框。

**参数：**

```typescript
interface AlertDialogOptions {
   title?: string;
   description?: string;
   content?: Component;
   confirmText?: string;        // 默认 "确定"
   variant?: 'info' | 'success' | 'warning' | 'error';  // 样式变体
}
```

**返回值：** `Promise<void>`

**示例：**

```typescript
// 成功提示
await dialog.alert({
   title: '保存成功',
   description: '文件已成功保存',
   variant: 'success',
});

// 错误提示
await dialog.alert({
   title: '操作失败',
   description: '网络连接失败，请稍后重试',
   variant: 'error',
});

// 警告提示
await dialog.alert({
   title: '注意',
   description: '您的会话即将过期',
   variant: 'warning',
});
```

---

### `dialog.custom(options)`

显示自定义对话框（暂未实现，预留接口）。

---

### `dialog.closeAll()`

关闭所有对话框。

**示例：**

```typescript
// 在路由跳转时关闭所有对话框
router.beforeEach(() => {
   dialog.closeAll();
});
```

---

## 实际使用案例

### 1. 文件删除确认

```typescript
async removeItem(path: string, type: 'file' | 'folder') {
   const confirmed = await dialog.confirm({
      title: type === 'file' ? '删除文件' : '删除文件夹',
      description: 
         type === 'file'
            ? '确定要删除该文件吗？此操作无法撤销。'
            : '确定要删除该文件夹及其所有内容吗？此操作无法撤销。',
      variant: 'danger',
      confirmText: '删除',
      cancelText: '取消',
   });

   if (!confirmed) return;

   try {
      await fs.rm(path);
      
      await dialog.alert({
         title: '删除成功',
         variant: 'success',
      });
   } catch (error) {
      await dialog.alert({
         title: '删除失败',
         description: '删除时发生错误',
         variant: 'error',
      });
   }
}
```

### 2. 文件重命名

```typescript
async renameItem(oldPath: string, defaultName: string) {
   const newName = await dialog.prompt({
      title: '重命名',
      description: '请输入新名称',
      placeholder: '新名称',
      defaultValue: defaultName,
      validator: (value) => {
         if (!value || value.trim().length === 0) {
            return '名称不能为空';
         }
         if (value.includes('/')) {
            return '名称不能包含斜杠';
         }
         return true;
      },
      confirmText: '重命名',
      cancelText: '取消',
   });

   if (!newName) return;

   try {
      await fs.rename(oldPath, newName);
   } catch (error) {
      await dialog.alert({
         title: '重命名失败',
         description: '重命名时发生错误，请检查名称是否已存在',
         variant: 'error',
      });
   }
}
```

### 3. 批量操作确认

```typescript
async deleteMultiple(items: string[]) {
   const confirmed = await dialog.confirm({
      title: '批量删除',
      description: `确定要删除选中的 ${items.length} 个项目吗？`,
      variant: 'danger',
      confirmText: `删除 ${items.length} 个项目`,
   });

   if (confirmed) {
      // 执行批量删除
   }
}
```

---

## 设计原则

1. **易用性优先** - API 简洁直观，符合使用习惯
2. **类型安全** - 完整的 TypeScript 类型定义
3. **容错处理** - SSR 环境自动降级，不会抛出错误
4. **视觉一致性** - 与应用整体设计保持一致
5. **可扩展性** - 预留自定义接口，方便未来扩展

---

## 架构说明

### 核心组件

- **DialogManager** - 单例管理器，负责对话框状态管理
- **DialogOverlay** - 覆盖层组件，负责渲染对话框
- **ConfirmDialog** - 确认对话框组件
- **PromptDialog** - 输入对话框组件
- **AlertDialog** - 警告对话框组件

### 状态管理

使用 Vue 的 reactive 系统管理对话框队列：

- 每个对话框有唯一的 ID
- 支持同时显示多个对话框（按顺序堆叠）
- Promise-based API，自动管理生命周期

### SSR 处理

在服务端渲染时：

- `confirm()` 返回 `false`
- `prompt()` 返回 `''`
- `alert()` 返回 `undefined`
- 不会抛出错误，不影响页面渲染

---

## 与原生 API 对比

| 特性 | 原生 API | Dialog API |
|------|---------|-----------|
| 视觉样式 | 系统默认 | 自定义设计 |
| 可定制性 | 低 | 高 |
| TypeScript | 无 | 完整支持 |
| SSR | 报错 | 自动降级 |
| 验证器 | 无 | 支持 |
| 异步处理 | 阻塞 | Promise |
| 可访问性 | 基本 | 优化 |
