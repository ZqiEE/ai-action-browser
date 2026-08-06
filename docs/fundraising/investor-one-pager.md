# AI Action Browser — Investor One-Pager

Status: pre-launch browser prototype. No live search, cross-site execution, payment, merchant settlement, or production identity system is currently connected.

## Category

**AI Action Browser is an AI-native web browser for getting things done across the web.**

It is not primarily a shopping assistant, affiliate site, chatbot, advertising marketplace, or autonomous purchasing bot.

The product category is the browser. U.S. laptop shopping is the first validation wedge. Outcome-based commercial revenue is the planned business model.

Canonical definition: [`../product-positioning.md`](../product-positioning.md).

## Thesis

AI will change the browser from a page-navigation tool into a user-controlled action layer.

People should be able to describe what they want, search normally when appropriate, compare evidence across websites, prepare the next action, and confirm important external actions without learning prompt engineering or surrendering final control.

The browser is the correct product surface because it can combine:

- normal web navigation and search;
- current-page, tab, and task context;
- site and data permissions;
- cross-site reading and preparation;
- persistent task state;
- trusted client-side confirmation;
- local policy enforcement;
- attribution of authorized commercial outcomes.

## Product

AI Action Browser exposes a clear behavior model:

1. **Search** — return ordinary information or web results;
2. **Compare** — gather multiple sources, explain trade-offs and uncertainty, and keep ranking independent from commercial bids;
3. **Prepare** — visit websites and prepare forms, bookings, purchases, or other tasks;
4. **Confirm / Commit** — show destination, amount, recipient, shared data, and reversibility before an important action, then require explicit confirmation and appropriate system authentication.

Models propose plans and candidate actions. Deterministic code validates permissions, schema, destination, totals, risk, and confirmation requirements before execution.

## First validation wedge

The first U.S. validation uses laptop shopping because it exercises the full browser model in a measurable, relatively bounded task:

- natural-language goal and conditions;
- normal Search versus explicit Compare and Prepare;
- multiple websites and conflicting evidence;
- price, delivery, return, and warranty validation;
- a merchant handoff without automatic payment;
- a plausible commercial outcome path.

This wedge is designed to prove the browser interaction, trust model, task cost, and initial outcome economics. It does not define the long-term product boundary.

## Business model: outcome-funded browser

Consumers remain free.

The commercial thesis is that parties receiving measurable value from a qualified or completed result can fund free consumer access. Planned revenue layers include:

- affiliate or completed-transaction commissions;
- qualified lead, activation, or booking fees;
- merchant-funded cashback and benefits;
- clearly separated Sponsored offers that improve the user's available deal;
- merchant and developer action interfaces;
- developer certification, compute usage, and marketplace services after browser distribution exists;
- enterprise administration and private deployment later.

The platform may charge for an auditable result or platform service. It must not sell private browsing history, hidden influence over recommendations, or a “best result” position.

Commercial bids, commission rates, partner tiers, campaign budgets, and expected revenue must not enter independent recommendation ranking.

## Why this can be defensible

The durable system is not a single model or chat interface. It is the combination of:

- browser-level user context and permissions;
- a constrained, auditable Action DSL;
- deterministic risk and confirmation policy;
- normalized, source-linked evidence with incremental updates;
- cross-site task execution and recovery;
- independent recommendation architecture;
- privacy-preserving outcome attribution;
- merchant and developer action integrations;
- measured completion quality and cost per result.

## Cost architecture

The company does not intend to run a fresh large-model workflow over unchanged evidence for every request.

The cost strategy is:

- normalized, source-linked public evidence;
- field-level freshness and change detection;
- deterministic calculation and policy enforcement;
- low-cost model routing;
- strong-model escalation only when needed;
- remote browser execution only after APIs, feeds, structured data, HTTP retrieval, and search are insufficient;
- strict per-task search, token, browser-time, retry, and monetary budgets.

The primary economic metric is **gross contribution per 100 user tasks**, including failed and abandoned work, commercial outcome revenue, reversals, and support or fraud costs when those systems exist.

## Current progress

- public browser, protocol, cloud-boundary, and operations repositories established;
- canonical product positioning and trust model documented;
- interactive React browser-experience prototype implemented;
- Omniprompt with explicit Search, Compare, and Prepare behavior;
- task progress, pause, stop, failure, retry, and recovery states;
- sourced comparison, uncertainty, Sponsored separation, and full-screen confirmation;
- responsive, dark-mode, RTL, reduced-motion, and forced-colors support;
- automated type checking, unit tests, build validation, and static-demo deployment workflow;
- 14-day U.S. validation and bounded AI-cost policies documented;
- Action Protocol direction defined for permissions, task state, confirmation, and constrained execution.

## Next proof points

- publicly accessible browser-experience demo;
- at least 20 U.S. consumer participants;
- at least 50 completed or clearly abandoned tasks;
- evidence that users understand Search, Compare, Prepare, sources, and confirmation;
- measured average and p95 task costs;
- meaningful Prepare-to-merchant-handoff behavior;
- at least one concrete affiliate, merchant, provider, or strategic-commercial path;
- evidence that a commercial beneficiary will pay for a qualified or completed result without influencing independent ranking;
- a limited browser-extension vertical slice after the Web validation.

## Initial raise rationale

A future pre-seed round would fund a focused AI-browser proof, not an unrestricted global browser launch.

Use of funds would focus on:

- one production-quality browser task vertical;
- browser extension and trusted client-side control surface;
- evidence acquisition and incremental-update infrastructure;
- task state, permission, and Action Protocol implementation;
- cost telemetry and model routing;
- U.S. consumer research;
- security, privacy, and confirmation review;
- initial merchant, provider, and developer integrations;
- outcome attribution experiments without automatic payment.

## Central risk

The central risk is not whether an AI interface can be built. It is whether an AI browser can reliably earn user trust, complete useful web tasks at bounded cost, and generate enough measurable commercial or platform value to fund free consumer access without selling private data or corrupting independent recommendations.

The validation plan is designed to answer that question before scaling engineering spend.
