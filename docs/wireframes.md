# Core Text Wireframes

本文件只冻结信息结构、阅读顺序和主要交互，不代表最终视觉稿。

## 1. 桌面首页

```text
┌──────────────────────────────────────────────────────────────────────┐
│ AI Action Browser                                      Sign in       │
│                                                                      │
│                                                                      │
│                What do you want to find or get done?                 │
│                                                                      │
│       ┌──────────────────────────────────────────────────────┐       │
│       │ Search │ Describe a goal or paste a link      ◉  +  │       │
│       │        │                                      mic    │       │
│       ├──────────────────────────────────────────────────────┤       │
│       │ Suggested: Compare options / Prepare this task       │       │
│       └──────────────────────────────────────────────────────┘       │
│                                                                      │
│       Example: Find a laptop under $1,000 with free returns          │
│       Example: Compare flights and prepare the best itinerary        │
│                                                                      │
│ Free · No account required · Important actions always reviewed       │
└──────────────────────────────────────────────────────────────────────┘
```

规则：

- Omniprompt 是唯一主焦点；
- 首次访问显示短标题；
- 示例任务最多 2–3 条；
- 登录入口视觉弱化；
- 不显示营销导航、功能宫格或 Dashboard。

## 2. 移动首页

```text
┌──────────────────────────────┐
│ AI Action Browser      Sign in│
│                              │
│ What do you want to find     │
│ or get done?                 │
│                              │
│ ┌──────────────────────────┐ │
│ │ Search                   │ │
│ │ Describe a goal...       │ │
│ │                          │ │
│ │                  mic  +  │ │
│ ├──────────────────────────┤ │
│ │ Compare options          │ │
│ │ Prepare this task        │ │
│ └──────────────────────────┘ │
│                              │
│ Recent: Laptop comparison    │
│                              │
│ Free · Private · Confirmed   │
└──────────────────────────────┘
```

键盘出现后：

- 标题缩小或隐藏；
- Omniprompt 上移至键盘上方；
- 意图建议保持可见；
- 最近任务和底部说明暂时收起。

## 3. 桌面购物比较页

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ [Omniprompt sticky: laptop under $1,000...]                    Stop/Edit  │
├──────────────────────────────────────────────────────────────────────────┤
│ Budget < $1,000  Use: Video  Delivery: Next week  Returns: Free   Edit   │
├──────────────────────────────────────────────┬───────────────────────────┤
│                                              │ Decision summary          │
│ BEST MATCH                                   │                           │
│ Lenovo Yoga Pro 7                            │ Total: $949               │
│ Why this fits you                            │ Arrives Friday            │
│ • Strong render performance                  │ 30-day free returns       │
│ • Balanced battery                           │                           │
│ Trade-off                                    │ [Prepare to buy]          │
│ • RAM cannot be upgraded                     │                           │
│                                              │ Alternatives              │
│ Price / delivery / returns / warranty        │ ASUS Vivobook 16   $799   │
│ Sources [1][2][3] · Updated 10 min ago       │ MacBook Air M2     $999   │
│ [View evidence]                              │                           │
│                                              │                           │
│ Key difference table                         │                           │
│ ┌─────────────┬───────────┬───────────┐       │                           │
│ │             │ ASUS      │ MacBook   │       │                           │
│ │ Price       │ $799      │ $999      │       │                           │
│ │ Main gain   │ Cheapest  │ Battery   │       │                           │
│ │ Main cost   │ Display   │ Storage   │       │                           │
│ └─────────────┴───────────┴───────────┘       │                           │
├──────────────────────────────────────────────┴───────────────────────────┤
│ Sponsored offer · Additional cashback from partner · Hide                │
└──────────────────────────────────────────────────────────────────────────┘
```

规则：

- 主推荐与决策侧栏构成 65/35；
- 两个备选为紧凑摘要与关键差异，不使用同尺寸大卡片；
- 主推荐必须显示 Trade-off；
- Sponsored 位于自然结果之后；
- 来源面板从右侧打开，不覆盖确认操作。

## 4. 移动购物比较页

```text
┌──────────────────────────────┐
│ ← Compare results       Edit │
│ Budget / Use / Delivery      │
├──────────────────────────────┤
│ BEST MATCH                   │
│ Lenovo Yoga Pro 7            │
│ $949 · arrives Friday        │
│                              │
│ Why this fits                │
│ + Strong rendering           │
│ + Free returns               │
│ − RAM cannot be upgraded     │
│                              │
│ Sources [1][2][3]            │
│ [View evidence]              │
├──────────────────────────────┤
│ Alternatives                 │
│ ASUS · $799 · cheaper        │
│ Main cost: display accuracy  │
│                              │
│ MacBook · $999 · battery     │
│ Main cost: 256GB storage     │
├──────────────────────────────┤
│ Sponsored offer · Hide       │
├──────────────────────────────┤
│ Total $949   [Prepare to buy]│ ← fixed action bar
└──────────────────────────────┘
```

规则：

- 不连续堆叠三个大型商品卡片；
- 来源使用全屏子页面或平台合适的 Sheet；
- 底部操作栏显示最终总价和单一主操作；
- Sponsored 不得进入固定操作栏。

## 5. 桌面极高风险确认页

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ← Back to comparison                         Review and confirm       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│             Destination                                              │
│             bestbuy.com                                              │
│             Connection: Encrypted                                    │
│             Merchant information: Matched · Demo status              │
│                                                                      │
│             Order                                      Edit           │
│             Lenovo Yoga Pro 7                         $899            │
│             Tax                                         $50            │
│             Shipping                                   Free            │
│             Total                                      $949            │
│             Cashback after purchase                    $18             │
│                                                                      │
│             Delivery                                   Edit           │
│             Address · Expected date · Return deadline                  │
│                                                                      │
│             Payment                                    Edit           │
│             Visa ending 4242 · Payment provider                         │
│                                                                      │
│             Data sharing                                Edit           │
│             Name, address, email, payment token                         │
│             Full card number is not shared                              │
│                                                                      │
│             Commercial disclosure                                     │
│             14px readable disclosure, always expanded                  │
│                                                                      │
│             [Cancel] [Edit order] [Confirm with system verification]   │
└──────────────────────────────────────────────────────────────────────┘
```

规则：

- 独立路由与完整页面；
- 内容列 680–760px；
- 无遮罩、背景页面、弹窗或收据卡片；
- Confirm 点击后才调用系统身份验证；
- Cancel 为中性操作，不使用危险红。

## 6. 移动极高风险确认页

```text
┌──────────────────────────────┐
│ ← Review and confirm         │
├──────────────────────────────┤
│ Destination                  │
│ bestbuy.com                  │
│ Encrypted                    │
│ Merchant match · Demo        │
├──────────────────────────────┤
│ Order                   Edit │
│ Lenovo Yoga Pro 7      $899  │
│ Tax                     $50  │
│ Shipping               Free  │
│ Total                  $949  │
│ Cashback                $18  │
├──────────────────────────────┤
│ Delivery                Edit │
│ Address · Friday · Returns   │
├──────────────────────────────┤
│ Payment                 Edit │
│ Visa ending 4242             │
├──────────────────────────────┤
│ Data sharing            Edit │
│ Name, address, email, token  │
├──────────────────────────────┤
│ Commercial disclosure       │
│ Full readable text          │
│                              │
│ page content scrolls         │
├──────────────────────────────┤
│ [Confirm with verification] │ ← fixed action area
│ Edit order        Cancel     │
└──────────────────────────────┘
```

规则：

- 全屏页面，不是 Bottom Sheet；
- 固定操作区不得遮挡正文；
- Confirm 为主操作；
- Edit 和 Cancel 保持可访问；
- 系统认证界面由平台呈现，不伪造 Face ID 或系统 UI。
