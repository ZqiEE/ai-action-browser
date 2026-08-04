# Frontend Design Tokens

设计方向：**Monochrome Core + Reserved Teal Accent**。

本文件定义语义角色，不要求实现层绑定特定 CSS 框架。组件必须引用语义 Token，不得直接散落原始色值。

## 1. 浅色模式

| Token | Value | 用途 |
|---|---:|---|
| `color.page` | `#F7F8F8` | 页面背景 |
| `color.surface` | `#FFFFFF` | 主内容表面 |
| `color.surface-subtle` | `#F1F3F4` | 次级区块 |
| `color.surface-raised` | `#FFFFFF` | 浮层与来源面板 |
| `color.text-primary` | `#17191C` | 主文字 |
| `color.text-secondary` | `#626A73` | 次文字 |
| `color.text-tertiary` | `#7B838C` | 时间戳与短标签 |
| `color.border` | `#DDE1E5` | 默认边框 |
| `color.border-strong` | `#B7BEC5` | 强边界 |
| `color.primary-bg` | `#17191C` | 主要按钮 |
| `color.primary-fg` | `#FFFFFF` | 主要按钮文字 |
| `color.accent` | `#00665E` | Focus、Active、Progress |
| `color.accent-subtle` | `#E6F1F0` | 轻量激活背景 |

## 2. 深色模式

| Token | Value | 用途 |
|---|---:|---|
| `color.page` | `#121314` | 页面背景 |
| `color.surface` | `#1C1E20` | 主内容表面 |
| `color.surface-subtle` | `#24272A` | 次级区块 |
| `color.surface-raised` | `#25282B` | 浮层与来源面板 |
| `color.text-primary` | `#F4F5F6` | 主文字 |
| `color.text-secondary` | `#A2A8AE` | 次文字 |
| `color.text-tertiary` | `#878E95` | 时间戳与短标签 |
| `color.border` | `#383C40` | 默认边框 |
| `color.border-strong` | `#555B61` | 强边界 |
| `color.primary-bg` | `#F4F5F6` | 主要按钮 |
| `color.primary-fg` | `#17191C` | 主要按钮文字 |
| `color.accent` | `#55BDB2` | Focus、Active、Progress |
| `color.accent-subtle` | `#193B38` | 轻量激活背景 |

## 3. 语义颜色

品牌 Accent 不承担成功、安全或商业含义。

| Role | Light | Dark | 用途 |
|---|---:|---:|---|
| `status.success` | `#178253` | `#42B883` | 已完成状态，必须配合图标/文字 |
| `status.warning` | `#A15C00` | `#E0A14A` | 信息过期、来源冲突、待确认 |
| `status.danger` | `#C62828` | `#F06A6A` | 不可逆破坏性操作 |
| `status.info` | `#2463A7` | `#6EA8E5` | 中立说明 |
| `commercial.surface` | `#F1F3F5` | `#24282D` | Sponsored 容器 |
| `commercial.border` | `#D5DAE0` | `#454C53` | Sponsored 边框 |
| `commercial.label` | `#4B5563` | `#B8C0C8` | Sponsored 标签 |
| `cashback` | `#9A6700` | `#D8A43B` | Cashback 金额 |

## 4. Focus 与交互状态

### Focus

- 可见 2px Accent 外框；
- 外侧保留 2px 页面色间隔；
- 不依赖阴影；
- `forced-colors` 下使用系统 Highlight。

### Hover

- 中性色表面轻微变化；
- 不通过阴影作为唯一反馈；
- 不改变布局尺寸。

### Pressed

- 表面加深或变浅一个层级；
- 可使用 1px 内边界；
- 不使用缩放造成页面抖动。

### Disabled

- 降低文字与边框对比；
- 保持文字可读；
- 不仅依赖透明度；
- 移除 Hover 和 Pressed 反馈。

## 5. 排版 Token

系统字体栈：

`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", sans-serif`

CJK 和阿拉伯文使用操作系统可用的本地字体回退。

| Token | Desktop | Mobile | Weight | Line height |
|---|---:|---:|---:|---:|
| `type.display` | 32px | 26px | 600 | 1.2 |
| `type.page-title` | 28px | 24px | 600 | 1.25 |
| `type.section-title` | 20px | 18px | 600 | 1.35 |
| `type.component-title` | 17px | 16px | 600 | 1.4 |
| `type.body-large` | 17px | 17px | 400 | 1.55 |
| `type.body` | 15–16px | 16px | 400 | 1.55 |
| `type.supporting` | 14px | 14px | 400 | 1.5 |
| `type.caption` | 12–13px | 13px | 400–500 | 1.45 |
| `type.button` | 14–15px | 16px | 500–600 | 1.2 |
| `type.price` | 24–28px | 20–24px | 650–700 | 1.15 |

价格与数值使用 `font-variant-numeric: tabular-nums`。

商业披露、数据共享和隐私说明不得使用 Caption，最低使用 Supporting。

## 6. 间距

基础单位 4px。

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px
- `space-10`: 40px
- `space-12`: 48px
- `space-16`: 64px

页面水平边距：

- 小屏：16px；
- 大手机/平板：20–24px；
- 桌面：32–48px；
- 内容最大宽度由页面类型控制。

## 7. 圆角

- 小标签和紧凑条件：6px；
- 按钮与输入控件：8px；
- Omniprompt：12px；
- 普通卡片：12px；
- 大面板：16px；
- 胶囊仅用于真正的开关、状态计数或平台标准控件。

## 8. 边框与阴影

### 边框

- 默认 1px；
- 选中推荐可使用 2px，但不得依赖颜色单独表达；
- Sponsored 使用普通实线，不使用优惠券虚线。

### 阴影

默认卡片无阴影。

浮层和来源面板可使用：

`0 8px 24px rgba(0, 0, 0, 0.10)`

深色模式降低扩散感，增加边框权重。不得使用 Accent 色阴影。

## 9. 尺寸与触摸

- 最小触摸目标：44×44px；
- 桌面主要按钮高度：44–48px；
- 移动主要按钮高度：52–56px；
- 图标视觉尺寸通常 18–24px，但热区独立满足 44px；
- Omniprompt 最小高度：桌面 60–64px，移动 64–72px。

## 10. 动效

- 状态变化：120–180ms；
- 页面元素位置变化：180–240ms；
- 来源 Side Panel：180–240ms；
- 不使用 Bounce、循环发光、呼吸、跑马灯或无限装饰动画；
- 进度线只表达真实或不确定进度；
- `prefers-reduced-motion` 下禁用位移和淡入。

## 11. 高对比模式

在 `forced-colors` 环境：

- 使用系统 Canvas、CanvasText、ButtonFace、ButtonText 和 Highlight；
- 不保留品牌颜色优先级；
- 边框不得透明；
- 状态必须同时包含文字和图形；
- Sponsored 使用明确文字标签而非背景色区分。
