# Quanta Challenge UI 组件库概览

本文档列出了 `packages/app/app/components/st` 目录下的标准 UI 组件及其预期用途。组件采用目录结构组织（如 `st/Button/index.vue`）。

## 基础组件 (Basic Components)

### 交互元素

* **Button (`st/Button`)**: 通用按钮组件。
  * **Props**: `size` (default/sm/lg), `theme` (primary/secondary/danger/success), `bordered` (boolean), `loading` (boolean).
  * **特点**: 支持加载状态（显示 Spinner），点击有缩放动画 (`active:scale-95`)。
* **Input (`st/Input`)**: 单行文本输入框。
* **Textarea (`st/Textarea`)**: 多行文本输入区域。
* **Select (`st/Select`)**: 下拉选择器。
* **Switch (`st/Switch`)**: 开关控件。
* **SlideRadioGroup (`st/SlideRadioGroup`)**: 滑动式单选组，常用于切换视图模式。
* **TagButton (`st/TagButton`)**: 标签式按钮，用于筛选或分类。
* **TextButton (`st/TextButton`)**: 纯文本按钮，无背景边框。

### 反馈与展示

* **Tag (`st/Tag`)**: 标签组件。
* **Avatar (`st/Avatar`)**: 用户头像。
* **Skeleton (`st/Skeleton`)**: 加载骨架屏。
* **EmptyStatus (`st/EmptyStatus`)**: 空状态展示。
* **Message (`st/Message`)**: 全局消息提示。
* **Progress (`st/Progress`)**: 进度条。
* **GlitchText (`st/GlitchText`)**: 故障艺术风格文本效果（用于特殊标题）。

### 导航与结构

* **Sidebar (`st/Sidebar`)**: 侧边栏导航。
* **Header (`st/Header`)**: 顶部导航栏。
* **DropdownMenu (`st/DropdownMenu`)**: 下拉菜单。
* **Modal (`st/Modal`)**: 模态对话框。
* **Drawer (`st/Drawer`)**: 抽屉式侧滑面板。
* **SplitPanel (`st/SplitPanel`)**: 分割面板，用于可调整大小的布局。
* **Scrollable (`st/Scrollable`)**: 自定义滚动区域。
* **Space (`st/Space`)**: 间距组件，用于控制子元素间距。
* **Spacer (`st/Spacer`)**: 占位组件，用于撑开空间。

## 业务/复合组件 (Business Components)

* **CodePreview (`st/CodePreview`)**: 代码预览块。
* **ProblemCard (`st/ProblemCard`)**: 题目卡片，展示题目信息。
* **JudgeResult (`st/JudgeResult`)**: 判题结果展示。
* **RankingChart (`st/RankingChart`)**: 排行榜图表。
* **HeatMap (`st/HeatMap`)**: 热力图（如用户活跃度）。
* **FileSystemTree (`st/FileSystemTree`)**: 文件树组件，用于编辑器侧边栏。
* **SearchOverlay (`st/SearchOverlay`)**: 全局搜索覆盖层。

## 开发建议

1. **组件引用**: 组件已自动注册，可直接使用 `<StButton>` (对应 `st/Button`)。
2. **Props 检查**: 使用前请查看组件定义的 Props 接口，确保正确传递参数。
3. **样式一致性**: 尽量使用 `st` 组件而非手写 HTML/CSS，以保持全站视觉风格统一。
