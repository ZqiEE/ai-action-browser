# Product Positioning

Status: canonical product definition. When other documents conflict with this file, this file takes precedence.

## One-sentence definition

**AI Action Browser is a free AI-native web browser that helps people search, understand, compare, and complete tasks across the web while keeping important actions under explicit user control.**

中文定义：

**AI Action Browser 是一个面向普通用户的免费 AI 浏览器。用户表达目标，浏览器负责搜索、理解、比较和准备跨网站任务；付款、发送、提交、删除等关键动作始终由用户明确确认。**

## Positioning hierarchy

The product must always be described in this order:

1. **Product category: AI browser.**
2. **User value: get things done across the web with less navigation and repeated work.**
3. **Core interaction model: Search → Compare → Prepare → Confirm / Commit.**
4. **First validation wedge: U.S. laptop shopping.**
5. **Business model: free consumer access funded by measurable commercial outcomes and clearly separated commercial services.**

The first use case and the business model must never replace the product category in external messaging.

## What makes it a browser

AI Action Browser is not defined only by a chat box or a recommendation page. The intended product owns the browser-level relationship between the user and the web:

- a persistent Omniprompt for search and tasks;
- normal web search and page navigation;
- awareness of the current page, tabs, and task context;
- explicit site and data permissions;
- cross-site reading, comparison, and preparation;
- a task state machine that can pause, resume, stop, recover, and complete;
- trusted client-side confirmation for important external actions;
- local policy enforcement and a constrained Action DSL;
- extension and desktop-browser surfaces as the product matures.

The current Web prototype demonstrates the browser interaction and trust model. It is not the final browser shell and must not be presented as a complete production browser.

## Core behavior model

### Search

Search is the default browser behavior. It returns normal information or web results and does not silently escalate into cross-site automation.

### Compare

Compare gathers evidence from multiple sources, explains differences and uncertainty, and helps the user make a decision. Commercial bids and commission rates cannot affect independent ranking.

### Prepare

Prepare can visit sites and prepare forms, reservations, purchases, or other tasks. It stops before an important external action.

### Confirm and Commit

Payment, sending, submission, deletion, public posting, signing, or other high-risk actions require a readable preview, deterministic risk policy, explicit user confirmation, and appropriate system authentication.

Models may propose actions. Deterministic code validates permissions, schemas, destination, risk, totals, and confirmation requirements before execution.

## First validation wedge

The first validation use case is choosing and preparing the purchase of a laptop in the United States.

This use case was selected because it provides:

- a familiar consumer task;
- multiple websites and conflicting evidence;
- measurable price, delivery, return, and warranty conditions;
- a clear transition from Search to Compare to Prepare;
- a commercial handoff that can be attributed without automatic payment;
- manageable legal and safety exposure for an early prototype.

Laptop shopping is a **validation wedge**, not the product category, brand identity, or permanent market boundary.

Future task categories may include travel booking, software selection, local services, subscriptions, forms, scheduling, procurement, and other web tasks, subject to safety, legal, and economic validation.

## Business model: outcome-funded browser

Consumers should be able to use the core browser without paying.

The commercial thesis is that parties receiving measurable value from a completed or qualified result can fund free consumer access. Potential revenue includes:

- affiliate or completed-transaction commissions;
- qualified lead or activation fees;
- merchant-funded cashback and benefits;
- clearly separated Sponsored offers that improve the user's available deal;
- merchant and developer action interfaces;
- developer certification, compute usage, and marketplace services after browser distribution exists;
- enterprise administration and private deployment later.

The product may be described as **outcome-funded** or **results-funded**, but it is still an AI browser. “Selling results” describes the economic model, not the product category.

## What the platform may sell

The platform may charge a commercial beneficiary for a contractually defined and auditable result, such as:

- an eligible completed transaction;
- a qualified and accepted lead;
- a confirmed booking or activation;
- a merchant-funded benefit selected by the user;
- usage of a merchant or developer action interface.

A commercial result should eventually define:

- the result type and success condition;
- the provider and destination;
- user confirmation status;
- attribution rules and window;
- completion evidence;
- cancellation, refund, reversal, and dispute rules;
- commercial terms;
- the minimum data required for reporting and settlement.

Early validation may measure merchant handoff and willingness to pay before production attribution and settlement exist.

## What the platform must never sell

The platform must not sell:

- the user's private browsing history;
- passwords, cookies, payment credentials, or private content;
- hidden influence over independent recommendations;
- a “best result” ranking position;
- automatic execution without the user's required confirmation;
- misleading merchant verification or safety claims;
- access to user decisions beyond the minimum data required for an authorized task or outcome.

Commercial relationships can fund execution and offer additional value, but cannot decide what is independently best for the user.

## Recommendation and commerce separation

The architecture must preserve a one-way dependency:

1. the recommendation layer evaluates user constraints and evidence;
2. independent ranking is completed without commission, bid, partner tier, campaign budget, or expected revenue data;
3. the commerce layer may then attach eligible benefits or clearly labeled Sponsored alternatives;
4. the user chooses and confirms the provider and action;
5. attribution and settlement occur only after the defined result state is reached.

CI and runtime controls should prevent recommendation services from depending on commercial bidding or expected-revenue inputs.

## Product identity: what it is not

AI Action Browser is not primarily:

- a chatbot with links;
- a shopping comparison website;
- an affiliate-content site;
- an advertising marketplace;
- an autonomous purchasing bot;
- a merchant dashboard;
- a generic agent framework without a consumer browser product;
- a result marketplace presented instead of a browser.

Some of these capabilities may exist inside the system, but none replaces the browser as the user-facing product.

## External messaging rules

### Preferred short description

> A free AI browser that searches, compares, and prepares web tasks, then asks before anything important.

### Preferred business description

> The browser is free for consumers. Commercial beneficiaries can pay for measurable outcomes, while independent recommendations remain technically separated from paid placement.

### Preferred first-wedge description

> We are validating the browser first with U.S. laptop shopping because it exercises cross-site search, comparison, evidence, preparation, confirmation, and measurable merchant handoff.

### Avoid

Do not lead with:

- “AI shopping assistant”;
- “consumer commerce product”;
- “affiliate shopping platform”;
- “results marketplace”;
- “an app that buys things for you.”

These descriptions narrow or distort the intended product.

## Product proof sequence

The company should earn the right to expand through evidence in this order:

1. users understand and prefer the browser interaction model;
2. Search, Compare, and Prepare work reliably for one narrow task category;
3. users understand evidence, uncertainty, permissions, destination, and confirmation;
4. task cost remains bounded, including failed and abandoned work;
5. merchant or provider handoffs create measurable value;
6. outcome revenue can cover the full task portfolio without changing independent ranking;
7. the product expands to more browser surfaces, task categories, developers, and providers.

## Canonical positioning statement

**AI Action Browser is building an AI-native browser for getting things done on the web. It is free for consumers, keeps important actions under their control, and is designed to earn revenue from measurable results and platform services without selling recommendation ranking or private browsing data.**
