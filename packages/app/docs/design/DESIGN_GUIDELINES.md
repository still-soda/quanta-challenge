# Quanta Challenge 设计规范与风格指南

本文档旨在总结 Quanta Challenge 应用的设计语言、视觉风格及交互规范。基于 `tailwind.css` 配置及组件库分析，我们提炼出以下核心设计原则。

## 1. 核心设计理念 (Core Design Philosophy)

Quanta Challenge 采用 **现代深色风格 (Modern Dark Theme)** 与 **高对比度 (High Contrast)** 的设计语言。

* **沉浸式深色体验**: 默认背景色为深灰/黑色 (`#111111`)，专为长时间编程设计，减少眼部疲劳。
* **活力点缀**: 使用高饱和度的橙色 (`#fa7c0e`) 和酸橙绿 (`#a6fb1d`) 作为主色和辅助色，营造科技感与活力。
* **清晰层级**: 通过灰度色阶 (`accent-100` 到 `accent-700`) 区分界面层级，确保内容可读性。

## 2. 色彩系统 (Color System)

应用使用 CSS 变量定义了一套语义化的色彩系统，直接映射到 Tailwind 配置中。

### 2.1 品牌色 (Brand Colors)

* **Primary (主色)**: `#fa7c0e` (Orange)
  * 用于主要按钮、关键行动点 (CTA)、选中状态。
  * 传达能量、挑战与创造力。

* **Secondary (辅助色)**: `#a6fb1d` (Lime Green)
  * 用于次要高亮、特殊装饰元素。
  * 提供视觉跳跃感，与深色背景形成鲜明对比。

### 2.2 背景与中性色 (Background & Neutrals)

* **Background**: `#111111` (接近纯黑) - 全局背景色。
* **Simple Editor Background**: `#1c1c1c` - 代码编辑器背景，略浅于全局背景以区分区域。
* **Accent Palette (灰度阶梯)**:
  * `accent-100` (#e5e5e5) - 主要文本
  * `accent-200` (#cacaca) - 次要文本
  * `accent-300` (#9d9d9d) - 辅助文本/图标
  * `accent-400` (#6d6d6d) - 禁用状态/边框
  * `accent-500` (#434343) - 分割线/深色边框
  * `accent-600` (#272727) - 卡片背景/悬停态
  * `accent-700` (#111111) - 深色底色

### 2.3 状态色 (State Colors)

* **Success**: `#14e87e` (Bright Green) - 通过测试、成功提示。
* **Error**: `#fa2f32` (Bright Red) - 错误、失败、危险操作。
* **Warning**: `#ffbe31` (Amber) - 警告、注意。

## 3. 排版 (Typography)

### 3.1 字体栈 (Font Stack)

* **Sans-serif (UI)**: `Manrope`, `Microsoft YaHei`, sans-serif.
  * 优先使用 `Manrope` (英文字体) 搭配 `Microsoft YaHei` (中文字体)，兼顾现代感与易读性。
* **Monospace (Code)**: `FiraCode Nerd Font Mono`, `Microsoft YaHei`, monospace.
  * 使用 `FiraCode` 提供优质的代码阅读体验（支持连字）。

### 3.2 预定义样式类 (Typography Classes)

应用在 `tailwind.css` 中定义了语义化的排版类：

* **Hero**: `.st-font-hero-bold` (2.5rem, Bold), `.st-font-hero-normal`
* **Secondary**: `.st-font-secondary-bold` (2rem, Bold), `.st-font-secondary-normal`
* **Third**: `.st-font-third-bold` (1.5rem, Bold), `.st-font-third-normal`
* **Body**: `.st-font-body-bold` (1rem, Bold), `.st-font-body-normal`
* **Caption**: `.st-font-caption` (0.875rem, Normal)
* **Tooltip**: `.st-font-tooltip` (0.625rem, Normal)

## 4. 组件设计规范 (Component Design)

### 4.1 按钮 (Buttons)

* **圆角**: 根据尺寸变化。
  * Default: `rounded-[0.5rem]` (8px)
  * Small: `rounded-[0.25rem]` (4px)
  * Large: `rounded-[0.75rem]` (12px)
* **交互**:
  * Hover: `opacity-80` (降低不透明度)
  * Active: `scale-95` (轻微缩小，提供点击反馈)
* **变体**:
  * `Solid`: 背景填充 (Primary/Secondary/Error/Success)，文字白色。
  * `Bordered`: 2px 边框，背景透明，文字颜色跟随主题色。

### 4.2 输入框 (Inputs)

* **样式**: 移除默认浏览器样式，自定义背景与边框。
* **自动填充**: 针对 Webkit 自动填充样式进行了覆盖，避免白色背景破坏深色主题 (`-webkit-box-shadow: inset 0 0 0px 1000px transparent`).

### 4.3 布局 (Layout)

* **全局**: `html` 和 `body` 设置为 `100vw/100vh`，`overflow-x: hidden`。
* **滚动条**: 隐藏默认滚动条 (`body::-webkit-scrollbar { display: none; }`)，追求极致简洁。

## 5. 图标系统 (Iconography)

* 主要使用 `@icon-park/vue-next` 图标库。
* 图标通常作为按钮内的辅助元素或导航菜单项。
* 加载状态使用 `LoadingFour` 图标配合 `animate-spin`。

---

*注：本规范基于 `packages/app/app/assets/css/tailwind.css` 及组件源码总结。*
