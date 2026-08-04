# AI Action Browser

面向所有人的永久免费 AI 行动浏览器。

用户只需表达目标，系统负责搜索、比较和准备；涉及付款、发送、提交、删除等关键操作时，用户进行明确确认并通过适当的系统身份验证。

## 当前阶段

项目已进入 **第一版 Web 前端交互原型阶段**。

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
- 单元测试、端到端冒烟测试和 GitHub Actions。

## 市场定位

产品服务全球普通消费者，第一发布与验证市场为美国：

- 默认产品语言为美式英语 `en-US`；
- 第一批购物演示使用美元、美国地址、税费、配送和退货表达；
- 货币、日期和文字方向使用国际化格式，不在组件中写死；
- 从第一版开始预留多语言、RTL、文字放大和不同地址格式；
- 美国市场验证后，优先扩展美国西班牙语、墨西哥、加拿大、欧洲和东亚市场。

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

原型只使用明确标注的演示数据，不会执行真实搜索、身份验证、付款或购买。

## 仓库边界

本仓库为公有主仓库，后续承载：

- `apps/web`：网页版；
- `apps/extension`：Chrome/Edge 扩展；
- `apps/desktop`：桌面浏览器；
- `crates`：共享 Rust 本地核心；
- `docs`：产品、设计、架构、安全与隐私文档；
- `sdk`：开放 SDK；
- `tests`：契约、端到端、安全与性能测试。

相关仓库：

- `action-browser-protocol`：开放协议、Action DSL、Schema 与 SDK 接口；
- `ai-action-browser-cloud`：私有云端服务；
- `ai-action-browser-ops`：私有部署、监控、反欺诈和运营配置。

## 文档

- [前端设计冻结 v1.0](docs/frontend-design-freeze-v1.0.md)
- [设计 Token](docs/design-tokens.md)
- [文字线框](docs/wireframes.md)
- [交互规范](docs/interaction-spec.md)
- [全球市场 UI 要求](docs/global-market-ui.md)
- [成本模型 v0.1](docs/cost-model-v0.1.md)
- [路线图](ROADMAP.md)

## 核心原则

1. 普通搜索始终可用，AI 不得秘密切换行为或执行操作。
2. 推荐排序不得接收广告出价、佣金或合作等级。
3. Sponsored 内容不得购买“最佳推荐”位置。
4. 关键操作必须展示完整预览和真实目标域名。
5. 极高风险操作使用独立全屏页面，不使用 Modal、遮罩或 Bottom Sheet。
6. 默认先准备，再确认；高风险操作必须进行明确确认。
7. 页面内容视为不可信输入，模型建议必须经过确定性验证。
8. 用户数据最小化收集，默认不用于训练。
9. 设计服务于全球普通消费者，不要求用户理解 AI、Rust 或协议。
10. 第一代产品优先完成购物比较与购买准备的完整闭环。
