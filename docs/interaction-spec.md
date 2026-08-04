# Core Interaction Specification

## 1. 行为模型

产品对用户暴露三种行为：

### Search

- 默认行为；
- 打开普通搜索结果或信息结果；
- 不访问多个网站执行操作；
- 不填写、提交或购买。

### Compare

- 搜集多个来源；
- 提取关键差异；
- 展示推荐、证据、不确定性和 Trade-off；
- 不替用户提交关键操作。

### Prepare

- 可以访问网站并准备填写、预订或购买步骤；
- 默认停在关键操作之前；
- 付款、发送、提交、删除等动作必须进入确认流程。

系统可以建议行为，但不得在用户不知情时从 Search 自动升级到 Compare 或 Prepare。

## 2. Omniprompt

### 默认

- 行为显示为 Search；
- 输入可自由编辑；
- 语音、图片和附件入口可见；
- Enter 执行默认 Search；
- Shift+Enter 换行。

### 意图建议

输入被识别为适合 Compare 或 Prepare 时，在输入区下方显示建议：

- 行为名称；
- 一句解释；
- 明确的接受操作；
- 继续普通搜索的路径。

键盘：

- 上下键移动选择；
- Enter 接受当前选择；
- Escape 关闭建议并保留输入；
- Tab 顺序符合视觉顺序。

### 执行中

- 输入内容保持可见；
- 输入区暂时只读或明确提示编辑会重启任务；
- 工具入口收起；
- 提供 Stop；
- 状态区显示当前步骤和已完成数量；
- 2px 进度线表示真实或不确定进度；
- 不使用呼吸、星星、跑马灯或无限装饰动画。

状态示例：

- Searching sources…
- Reading 4 of 8 pages…
- Comparing prices · 8 of 12 stores checked
- Preparing checkout · Review required before purchase

### 停止

- Stop 立即阻止新动作调度；
- 已完成结果保留；
- 页面显示 Paused；
- 用户可以 Resume、Edit goal 或 Start over。

### 错误

错误在 Omniprompt 下方就地显示：

- 简短原因；
- 已完成内容；
- Retry；
- Use normal search；
- Edit goal。

不得只显示“Something went wrong”。

## 3. 首页到结果页

### Search

1. 用户输入；
2. 按 Enter；
3. Omniprompt 吸顶；
4. 稳定框架立即出现；
5. 摘要和结果渐进填入；
6. 用户可打开来源或返回普通网页结果。

### Compare

1. 系统建议 Compare；
2. 用户接受；
3. Omniprompt 显示来源搜集进度；
4. 条件提取后显示可编辑条件；
5. 主推荐先显示已确认信息；
6. 备选和证据填入预留区域；
7. 冲突和过期信息始终可见。

### Prepare

1. 系统建议 Prepare，或用户在结果页点击 Prepare；
2. 系统展示将要准备的步骤；
3. 用户授权必要站点或数据范围；
4. 系统准备任务；
5. 遇到关键操作进入 Awaiting confirmation；
6. 导航至独立全屏确认页。

## 4. 条件控件

每个条件包含：

- 条件名称；
- 条件值；
- 编辑；
- 删除；
- 来源：用户明确输入或系统推断。

系统推断的条件必须可识别，并允许用户纠正。

修改条件后：

- 受影响结果显示局部 Updating；
- 旧结果保持可读但标记为正在更新；
- 不清空整个页面；
- 推荐发生变化时说明原因。

## 5. 主推荐与备选

### 主推荐

主推荐变化必须由用户选择或条件变化触发。不得由 Sponsored、佣金或合作关系触发。

显示：

- Why this fits；
- 关键优势；
- 必须接受的缺点；
- 总价；
- 配送、退货、保修；
- 来源和更新时间；
- 冲突状态。

### 备选

点击备选后：

- 先显示 Selected 状态；
- 决策侧栏更新价格和差异；
- 不立即进入购买；
- 用户需要单独点击 Make main choice 或 Prepare。

## 6. 来源面板

触发方式：

- 点击引用编号；
- 点击 View evidence；
- 键盘 Enter/Space。

桌面：右侧 Side Panel。

移动：全屏子页面或符合平台规范的 Sheet；极高风险确认页不得使用 Sheet。

面板内容：

- 当前被支持的结论；
- 来源名称和类型；
- 获取时间；
- 原文片段的合规摘要；
- 信息是否可能过期；
- 与其他来源的冲突；
- 打开原网页。

关闭后焦点返回触发元素。

## 7. Sponsored

- 位于自然结果之后；
- 使用 `Sponsored offer` 明文；
- 允许 Hide；
- 隐藏不改变自然推荐；
- Cashback 与当前付款金额分开呈现；
- 商家 Logo 尺寸受限；
- 不允许自定义卡片背景或动画；
- Sponsored 点击可以打开优惠详情，但不能直接触发高风险购买。

## 8. Prepare 到确认页

点击 Prepare：

1. 按钮原位显示 Preparing review…；
2. 防止重复点击；
3. 准备完成后执行正常页面导航；
4. 保留返回比较页的历史；
5. 不使用 Scrim、Modal、背景模糊或卡片下坠动画。

## 9. 极高风险确认页

### 页面进入

- 独立路由；
- 焦点落在页面标题；
- 屏幕阅读器宣布动作和金额；
- 全部关键内容可在确认前阅读。

### 可编辑区块

Order、Delivery、Payment、Data sharing 均有 Edit。

Edit：

- 进入对应编辑页面或就地编辑；
- 保存后返回确认页；
- 更新后的金额或数据共享范围需要明显标记；
- 确认按钮在关键内容变化后重新启用。

### 确认

- 主按钮文案描述真实动作，例如 `Confirm $949 purchase`；
- 点击后进入系统身份验证；
- 不伪造 Face ID、Touch ID、Windows Hello 或 Passkey 界面；
- 验证期间阻止重复提交；
- 用户取消系统验证后返回确认页，不执行动作。

### 失败

区分：

- Authentication cancelled；
- Authentication failed；
- Network interrupted；
- Merchant rejected payment；
- Price changed；
- Item unavailable；
- Duplicate submission blocked。

每类失败均提供明确下一步，不自动重试高风险提交。

### 成功

成功页保持正常中性背景，展示：

- 成功状态；
- 动作摘要；
- 订单号或回执；
- 执行时间；
- 下一步；
- 可取消或撤销入口（如果存在）；
- 返回任务。

不使用全屏绿色背景。

## 10. 认证与风险等级

- 低风险：无需确认；
- 中风险：页面内简短确认；
- 高风险：完整预览确认；
- 极高风险：独立全屏预览 + 系统身份验证。

风险等级由确定性策略决定，不由模型自由判断。

## 11. 响应式与平台行为

### Web/Desktop

- 来源使用 Side Panel；
- 键盘快捷键完整；
- 主要内容最大宽度受控；
- 高风险页面为独立路由。

### Extension Popup

- 仅显示 Omniprompt、当前状态和简短结果；
- 复杂比较打开 Side Panel 或新标签页；
- 不在狭窄弹窗完成高风险确认。

### Side Panel

- 保持任务上下文；
- 可与当前网页并列；
- Prepare 前明确展示目标站点和权限范围。

### iOS/Android

- 使用平台系统认证；
- 触摸目标至少 44×44；
- 尊重系统文字缩放、动态类型、高对比和减少动画；
- 平台返回操作不得绕过确认或产生重复提交。

## 12. 无障碍

- 所有图标按钮具有具体名称；
- 状态变化通过 Live Region 适度宣布；
- 不依赖颜色表达状态；
- 焦点顺序与视觉顺序一致；
- Side Panel 和页面导航恢复焦点；
- 200% 缩放可用；
- 320px 宽度无横向滚动；
- 商业披露、隐私和数据共享文字最低 14px；
- 动画遵循 `prefers-reduced-motion`。
