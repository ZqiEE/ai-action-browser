# AI Action Browser

面向普通用户的永久免费 AI 浏览器。

用户表达目标，浏览器负责搜索、理解、比较和准备跨网站任务；重要的提供方交接与外部动作始终由用户明确确认。消费者不需要订阅，商业方可以为连接器软件或经过验证的结果付费，但不能购买独立推荐排名。

## 产品定位

产品定位以 [`docs/product-positioning.md`](docs/product-positioning.md) 为准：

1. **产品类别是 AI 浏览器**；
2. **用户价值是更少地手动导航网页，更直接地完成互联网任务**；
3. **核心行为是 Search → Compare → Prepare → Confirm / Commit**；
4. **美国笔记本电脑任务是第一条正式产品路径，不是永久产品边界**；
5. **消费者完全免费，结果受益方承担商业费用**；
6. 推荐排序不得接收广告出价、佣金、合作等级或预期收入。

> A free AI browser that searches, compares, and prepares web tasks, then asks before anything important.

## 当前状态

仓库已包含第一版可部署产品架构和可安装的 Chrome／Edge 浏览器侧边栏入口，但尚不能在外部生产配置完成前声称已经公开上线。

### 已实现

- 空白目标入口的消费者 AI 浏览器首页与 Omniprompt，而不是预填购物任务；
- 相互独立的普通 Search、Compare、Prepare、Confirm 路径；
- Chrome／Edge Manifest V3 Side Panel，用户点击扩展后可在当前网页旁启动 Search、Compare 或 Prepare；
- 扩展仅申请 `activeTab` 与 `sidePanel`，不申请浏览历史、持久 `tabs`、Cookie、Storage、Host Permissions 或 Content Scripts；
- 当前页上下文只读取标题与经过隐私裁剪的 `origin + pathname`，主动剥离 credentials、query 和 fragment，并且不由扩展持久保存；
- 用户可以关闭“使用当前页上下文”，关闭后不会把当前页信息带入任务；
- Brave Search API 实时搜索接口；
- 可选、有限预算的 OpenAI 自然语言约束提取；
- Cloudflare Worker API 与 D1 数据库；
- Provider 与 Offer 导入接口；
- 每个 Provider 独立的 Offer API Token、Webhook HMAC 密钥与凭证轮换；
- Provider 自检接口，验证激活状态、Offer 新鲜度和 `readyForTraffic`；
- 不读取佣金、出价、合作等级和预期收入的独立比较；
- 用户确认前展示提供方、域名、金额、证据、共享数据与商业披露；
- Prepare、Confirm、Outcome Receipt 和提供方交接；
- 用户确认成功后才释放当前浏览器 Session 的 Provider continuation；
- 随机归因标识，且公开 Outcome Receipt 不暴露归因 Token 或 continuation URL；
- HMAC 签名的 accepted、completed、cancelled、refunded、disputed 结果事件；
- 结果事件幂等处理与退款、取消、争议状态；
- 生产请求限流、窗口级匿名客户端哈希、Request ID 与结构化运行日志；
- 定时清理过期限流数据；
- OpenAPI 3.1 生产接口契约及 CI 语法校验；
- Provider Outcome Connector 页面与接入 JSON；
- Web 类型检查、单元测试、生产构建、桌面和移动端 Playwright 契约测试；
- 扩展 Manifest 隐私门槛、Node 测试、JavaScript 语法检查和可安装 ZIP Artifact；
- API 严格 TypeScript 检查与安全、运行、Provider Diagnostics 测试；
- 锁定依赖的 `npm ci`、生产依赖审计、受控 Worker 与 GitHub Pages 部署工作流。

### 上线前仍必须完成

- 创建并绑定正式 D1 数据库并执行全部 migration；
- 配置 Cloudflare、Brave Search、Provider 管理与 Provider 凭证主密钥；
- 设置准确的 Web/API Origin 与仓库部署变量；
- 建立安全的 Provider 凭证交付渠道；
- 接入并验证至少一个真实 Provider、Feed、Sandbox、联盟批准、LOI 或商业集成；
- 发布隐私政策、条款、删除流程与支持联系方式；
- 配置生产告警阈值、备份、事故响应和运行责任人；
- 在真实 Chrome／Edge、桌面和移动设备验证公开 URL 与扩展任务流。

生产环境不会在 API 或 Provider 失败时用缓存或 Fixture 冒充实时结果。Fixture 只存在于自动化测试或明确的本地测试环境。

## 第一版正式任务

第一版只完成一条可收费、可验证的浏览器任务链：

```text
用户在 Web 或浏览器 Side Panel 提出目标
        ↓
可选带入用户主动授权的当前页上下文
        ↓
普通实时 Search 或主动选择 Compare
        ↓
浏览器读取真实 Provider Offer
        ↓
根据用户条件独立排序
        ↓
用户选择提供方并查看证据
        ↓
浏览器创建 Prepare 与内部归因记录
        ↓
用户明确确认提供方交接
        ↓
当前浏览器 Session 获得 Provider continuation
        ↓
Provider 回传接受、完成、取消、退款或争议
        ↓
按结果合同决定是否结算
```

第一版不自动付款。用户进入 Provider 后仍能看到并控制最终结账。完整桌面浏览器壳、更多任务类别和更高风险 Commit 是后续阶段；浏览器当前页入口已经通过 Chrome／Edge Side Panel 开始落地。

## 商业模式

第一批付费客户不是传统广告商，而是任务履约方或合作网络。

Provider 可以购买：

- Feed 和 Offer 接入；
- Action／Prepare 连接器；
- 归因与结果事件接口；
- 技术上线服务；
- Connector 软件服务；
- 合格交接或完成结果；
- 改善用户最终条件的返现或权益。

Provider 不能购买：

- 独立推荐第一名；
- 隐藏竞争对手；
- 用户私人浏览历史；
- 密码、Cookie 或支付凭据；
- 绕过用户确认的自动执行。

## 项目结构

- [`apps/web`](apps/web)：消费者 Web 产品与 Provider 接入页面；
- [`apps/api`](apps/api)：Cloudflare Worker、D1、搜索、Provider Offer、Prepare、Outcome、运行保护与回调；
- [`apps/extension`](apps/extension)：可安装的 Chrome／Edge Side Panel、当前页上下文入口与最小权限边界；
- `apps/desktop`：后续桌面 AI 浏览器外壳；
- `crates`：后续共享 Rust 本地策略核心；
- `docs`：产品、设计、架构、安全、隐私、验证与商业边界；
- `sdk`：后续开放 SDK；
- `tests`：契约、端到端、安全与性能测试。

相关仓库：

- `action-browser-protocol`：开放 Action DSL、Schema 与 SDK 接口；
- `ai-action-browser-cloud`：私有云端扩展服务；
- `ai-action-browser-ops`：私有部署、监控、反欺诈和运营配置。

## 本地运行

### API

```bash
cd apps/api
npm ci
cp .dev.vars.example .dev.vars
# 创建 D1，并将 database_id 写入 wrangler.toml
npm run db:migrate:local
npm run dev
```

详见 [`apps/api/README.md`](apps/api/README.md)。

### Web

```bash
cd apps/web
npm ci
cp .env.example .env.local
npm run dev
```

验证：

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

### Chrome／Edge Extension

扩展没有运行时 npm 依赖。开发安装：

1. 打开 `chrome://extensions` 或 `edge://extensions`；
2. 开启 Developer mode；
3. 选择 **Load unpacked**；
4. 选择 [`apps/extension`](apps/extension) 目录；
5. 在正常 HTTP/HTTPS 页面点击 **AI Action Browser**。

验证：

```bash
node --check apps/extension/service-worker.js
node --check apps/extension/sidepanel.js
node --check apps/extension/lib/context.mjs
node apps/extension/scripts/validate-manifest.mjs
node --test apps/extension/tests/*.test.mjs
```

CI 通过后会生成 `ai-action-browser-extension.zip` Artifact，用于真实 Chrome／Edge 安装验证。

## 当前执行顺序

1. 合并产品定位与 Production V1；
2. 创建正式 D1 并配置生产 API、Origin、密钥与告警；
3. 发布生产 Web/API URL，并验证浏览器 Side Panel 指向正式 Web 产品；
4. 接入至少一个真实 Provider 或合作网络并通过 Diagnostics；
5. 同步开展 Provider 销售，不等待完整桌面浏览器；
6. 运行至少 50 个免费消费者真实浏览器任务；
7. 计算每 100 个任务的完整成本、结果收入和毛贡献；
8. 根据真实数据决定扩展任务类别、桌面浏览器壳、融资或停止。

商业启动任务见 [Issue #2](https://github.com/ZqiEE/ai-action-browser/issues/2)。

## 核心原则

1. 产品类别始终是 AI 浏览器。
2. 消费者核心浏览器永久免费，不设置伪装付费墙。
3. 普通 Search 始终可用，系统不得秘密升级行为。
4. 模型提出建议，确定性代码验证权限、Schema、目标、风险和结果状态。
5. 推荐排序不得读取商业出价、佣金、合作等级或预期收入。
6. Provider 付款不得购买“最佳推荐”。
7. 关键交接必须展示真实目标域名、金额、共享数据和商业披露。
8. 结果必须可归因、可反转、可争议并可审计。
9. 用户数据最小化收集，默认不用于训练。
10. 每个生产任务必须拥有搜索、模型、浏览器时间、重试和金额上限。
11. 生产失败不得由未标注 Fixture 静默掩盖。
12. 浏览器权限遵循最小化原则，当前页上下文只能由用户主动调用并明确选择是否带入任务。
13. 先完成真实任务链和浏览器入口，再扩展完整桌面浏览器壳与任务类别。
