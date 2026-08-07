# AI Action Browser

面向所有人的永久免费 AI 浏览器。

用户只需表达目标，浏览器负责搜索、理解、比较和准备跨网站任务；涉及付款、发送、提交、删除等关键操作时，用户进行明确确认并通过适当的系统身份验证。

## 产品定位

产品定位以 [`docs/product-positioning.md`](docs/product-positioning.md) 为准。

定位层级必须保持清楚：

1. **产品类别是 AI 浏览器**，不是购物网站、聊天机器人或结果市场；
2. **用户价值是更少地手动导航网页，更直接地完成互联网任务**；
3. **核心行为是 Search → Compare → Prepare → Confirm / Commit**；
4. **美国笔记本电脑购物只是第一条验证路径**，不是产品边界；
5. **“卖结果”是商业模式**：消费者免费，结果受益方可为可验证的成交、激活、预约、合格线索或平台服务付费；
6. 推荐排序不得接收广告出价、佣金、合作等级或预期收入，商业付款不能购买“最佳推荐”。

推荐对外描述：

> A free AI browser that searches, compares, and prepares web tasks, then asks before anything important.

当前 Web 原型用于验证 AI 浏览器的交互、任务状态和信任边界，不代表已经完成生产级浏览器外壳、实时跨站执行或结果结算系统。

## 当前阶段

项目已进入 **第一版 Web 前端交互原型与美国市场验证准备阶段**。

当前分支实现：

- 首页与可编辑 Omniprompt；
- 默认 Search，以及明确的 Compare、Prepare 选择；
- 基于输入内容的确定性意图建议，但不会自动切换模式；
- 可暂停、恢复、停止、失败、重试和完成的任务状态；
- 跨网站购物比较决策页；
- 主推荐、两项备选、关键取舍和最终价格；
- 来源详情、信息冲突和可追溯链接；
- 与自然推荐分离、可隐藏的 Sponsored 模块；
- 独立全屏高风险确认页；
- 系统身份验证成功和失败模拟；
- 路由错误的安全恢复页面；
- 通用 TextField 与 Status 无障碍组件；
- 浅色、深色、RTL、强制高对比和减少动态效果；
- 单元测试、端到端冒烟测试和 GitHub Actions；
- GitHub Pages 静态部署流程；
- AI 成本上限、14 天验证计划与融资材料。

## 市场定位

产品服务全球普通消费者，第一发布与验证市场为美国：

- 默认产品语言为美式英语 `en-US`；
- 第一批购物演示使用美元、美国地址、税费、配送和退货表达；
- 货币、日期和文字方向使用国际化格式，不在组件中写死；
- 从第一版开始预留多语言、RTL、文字放大和不同地址格式；
- 美国市场验证后，优先扩展美国西班牙语、墨西哥、加拿大、欧洲和东亚市场。

美国笔记本电脑购物用于验证 AI 浏览器的 Search、Compare、Prepare、来源、权限、确认和商家交接，不把产品永久限定为购物助手。

详见 [全球市场 UI 要求](docs/global-market-ui.md)。

## 已冻结的视觉方向

**Monochrome Core + Reserved Teal Accent**

- 白天使用白色与浅灰结构；
- 夜间使用深灰黑结构；
- 主要按钮使用黑白反色；
- 湖水绿只用于 Focus、Active、Progress 和少量品牌识别；
- 成功、警告、危险和商业内容使用独立语义颜色；
- 不使用紫色 AI 渐变、发光、玻璃拟态、机器人、魔法棒或星星符号。

## Web 原型

代码位于 [`apps/web`](apps/web)。

```bash
cd apps/web
npm install
npm run dev
```

其他命令：

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

原型只使用明确标注的演示数据，不会执行真实搜索、身份验证、付款、购买或商业结果结算。

GitHub Pages 部署工作流位于 [`.github/workflows/pages.yml`](.github/workflows/pages.yml)。当仓库 Pages 环境允许 GitHub Actions 发布后，公开地址应为：

`https://zqiee.github.io/ai-action-browser/`

## 当前执行顺序

1. 发布并验证公开 Demo；
2. 申请 Google Cloud、AWS 与 Microsoft startup credits；
3. 只验证美国笔记本电脑比较和购买准备场景；
4. 招募至少 20 位美国消费者并完成至少 50 次任务；
5. 测量平均与 p95 任务成本、信任、Prepare 完成率和商家跳转；
6. 验证至少一条可归因的商业结果路径或明确的合作方付费意愿；
7. 小规模预热相关投资人；
8. 有真实证据后决定是否正式启动 Pre-seed。

本阶段不继续扩大为完整桌面浏览器、开发者市场、广告竞价平台或真实自动付款。这里的范围冻结是验证策略，不改变产品最终属于 AI 浏览器这一类别。

## 仓库边界

本仓库为公有主仓库，后续承载：

- `apps/web`：网页版与浏览器交互原型；
- `apps/extension`：Chrome/Edge 扩展；
- `apps/desktop`：桌面 AI 浏览器；
- `crates`：共享 Rust 本地核心；
- `docs`：产品、设计、架构、安全、隐私与商业边界文档；
- `sdk`：开放 SDK；
- `tests`：契约、端到端、安全与性能测试。

相关仓库：

- `action-browser-protocol`：开放协议、Action DSL、Schema 与 SDK 接口；
- `ai-action-browser-cloud`：私有云端服务；
- `ai-action-browser-ops`：私有部署、监控、反欺诈和运营配置。

## 文档

### 产品与设计

- [产品定位](docs/product-positioning.md)
- [前端设计冻结 v1.0](docs/frontend-design-freeze-v1.0.md)
- [设计 Token](docs/design-tokens.md)
- [文字线框](docs/wireframes.md)
- [交互规范](docs/interaction-spec.md)
- [全球市场 UI 要求](docs/global-market-ui.md)
- [无障碍验收清单](docs/accessibility-acceptance.md)

### 成本与验证

- [成本模型 v0.1](docs/cost-model-v0.1.md)
- [AI 成本政策](docs/launch/ai-cost-policy.md)
- [14 天美国验证计划](docs/launch/14-day-validation-plan.md)
- [验证指标模板](docs/launch/validation-metrics-template.md)

### 融资准备

- [投资人 One-pager](docs/fundraising/investor-one-pager.md)
- [投资人外联材料](docs/fundraising/investor-outreach.md)
- [Startup Credits 申请清单](docs/fundraising/startup-credits-checklist.md)

- [路线图](ROADMAP.md)

## 核心原则

1. 产品类别始终是 AI 浏览器，首个购物场景和结果商业模式不得取代产品定位。
2. 普通搜索始终可用，AI 不得秘密切换行为或执行操作。
3. 推荐排序不得接收广告出价、佣金、合作等级或预期收入。
4. Sponsored 内容不得购买“最佳推荐”位置。
5. 关键操作必须展示完整预览和真实目标域名。
6. 极高风险操作使用独立全屏页面，不使用 Modal、遮罩或 Bottom Sheet。
7. 默认先准备，再确认；高风险操作必须进行明确确认。
8. 页面内容视为不可信输入，模型建议必须经过确定性验证。
9. 用户数据最小化收集，默认不用于训练。
10. 设计服务于全球普通消费者，不要求用户理解 AI、Rust 或协议。
11. 第一代产品优先完成购物比较与购买准备的完整闭环，但保持通用浏览器任务模型。
12. 每个生产 AI 任务必须在执行前拥有搜索、Token、浏览器时间、重试和金额上限。
13. 用户每次获得 AI 级体验，但系统不为未变化的公共证据重复支付完整推理成本。
14. 商业收入可以来自可验证结果和平台服务，但不得出售用户私密浏览数据或独立推荐顺序。
