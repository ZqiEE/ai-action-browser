# 14-Day U.S. Validation Plan

## Positioning guardrail

This experiment validates the first task vertical of an **AI browser**.

The product category is not “shopping assistant,” “comparison website,” “affiliate platform,” or “results marketplace.” U.S. laptop shopping is used because it exercises Search, Compare, Prepare, evidence, confirmation, merchant handoff, and bounded cost in one measurable workflow.

The business hypothesis is outcome-funded free browser access. Commercial validation must remain downstream of independent recommendation and must not require paid ranking.

Canonical positioning: [`../product-positioning.md`](../product-positioning.md).

## Decision at the end

After 14 days, decide one of four paths:

1. begin a focused pre-seed raise for the next AI-browser proof;
2. continue cost, task reliability, and product optimization;
3. narrow or change the first browser task vertical;
4. stop spending on the current direction.

The goal is evidence, not feature completeness or a premature full-browser build.

## Scope freeze

For this validation period:

- product category: AI browser;
- validation surface: public Web browser-experience prototype;
- market: United States;
- language: U.S. English;
- first task vertical: choosing a laptop under a stated budget;
- product set: 10–30 products;
- merchants: 3–5 sources;
- behavior model: Search, Compare, Prepare, then handoff;
- action boundary: prepare and hand off, not automatic payment;
- participants: at least 20 U.S. consumers;
- completed or clearly abandoned sessions: at least 50;
- paid model calls: at most one primary reasoning call per completed comparison.

Do not add native apps, a developer marketplace, advertising auctions, unrestricted automation, real payment execution, additional countries, or unrelated task categories during the test.

## Core questions

The test must answer three different layers instead of blending them together.

### Browser product

- Do users understand that the product can search normally and also help complete web tasks?
- Do Search, Compare, and Prepare feel like understandable browser behaviors?
- Do users retain control when the system suggests a stronger behavior?
- Do users prefer this workflow over ordinary search for the selected task?

### Trust and execution

- Can users explain the recommendation and its main trade-off?
- Do they notice sources, uncertainty, stale data, and conflicts?
- Do they understand the destination, amount, data sharing, and action boundary before handoff?
- Can they stop, edit, retry, or fall back to normal search?

### Economics

- What are the average and p95 costs of Search, Compare, and Prepare?
- How many completed comparisons reach Prepare and merchant handoff?
- Is there at least one concrete provider, affiliate, merchant, or strategic path that pays for a qualified or completed result?
- Can plausible revenue cover successful, failed, and abandoned browser tasks without changing independent ranking?

## Days 1–2: Publish and instrument

- deploy the existing Web prototype;
- verify desktop and mobile routes;
- add a visible demo-data disclosure;
- add concise copy identifying the product as an AI browser and the laptop flow as the first demonstration task;
- define task, session, behavior, and outcome identifiers;
- distinguish Search, Compare, Prepare, confirmation preview, and merchant handoff events;
- implement cost event fields before connecting a live model;
- set daily and per-task spend alerts;
- prepare a short privacy notice for test participants.

Exit condition: a participant can open a public URL, understand that it is a browser experience, and finish the prototype flow without assistance.

## Days 3–4: Prepare the narrow dataset

- select 10–30 representative laptop products;
- normalize price, specification, delivery, return, and warranty fields;
- store source and retrieval timestamps for every field;
- classify fields by freshness risk;
- define incremental update and conflict rules;
- create fixed fallback fixtures for outages and budget exhaustion;
- keep the data model adaptable to future non-shopping result types rather than embedding shopping logic in browser-level task contracts.

Exit condition: every displayed claim maps to a source or an explicit demo fixture, and browser-level task state remains separate from product-specific evidence.

## Days 5–6: Add one bounded AI path

- use a low-cost model for intent and condition extraction;
- use deterministic code for filtering, arithmetic, permission, and behavior policy;
- allow one reasoning call for trade-off explanation;
- validate model output against a schema;
- refuse unsupported claims;
- log search, model, browser, retry, and total task cost;
- enforce the hard ceilings in `ai-cost-policy.md`;
- preserve ordinary Search fallback when Compare or Prepare cannot complete.

Exit condition: a complete task cannot exceed its configured monetary ceiling and never silently escalates behavior.

## Days 7–10: Run user sessions

Recruit at least 20 U.S. participants outside the immediate technical circle.

For each session, record:

- whether the user understood that the product is a browser for search and tasks;
- whether the first prompt was understood;
- whether the user selected Search, Compare, or Prepare correctly;
- whether the user noticed and understood an intent suggestion;
- whether the recommendation reason and primary trade-off were understood;
- whether the user noticed uncertainty and sources;
- whether Sponsored content was correctly distinguished;
- whether the user reached Prepare and merchant handoff;
- whether the user would use this browser workflow again for a similar task;
- whether the user preferred ordinary search instead;
- task cost, retries, failures, fallback, and abandonment reason.

Do not coach participants through the interface unless they are completely blocked; observed confusion is data.

## Days 11–12: Commercial outcome signal

- apply to relevant affiliate programs or networks;
- contact at least five merchants, providers, affiliate managers, commerce partners, or developer-platform partners;
- describe the product first as an AI browser and laptop shopping as the initial validation wedge;
- ask which events they pay for: qualified handoff, accepted lead, activation, booking, completed transaction, merchant-funded benefit, or platform-interface usage;
- document result definitions, attribution windows, commission ranges, cancellation rules, data requirements, and restrictions;
- ask whether they would run a paid design-partner pilot or provide a written statement of commercial interest;
- do not promise paid recommendation placement;
- do not share private browsing history or user task content beyond the minimum authorized test data.

Exit condition: obtain at least one concrete commercial outcome path or clearly document why none is currently accessible.

## Days 13–14: Decide and package evidence

Create a one-page results report containing:

- participant count;
- completed and abandoned task count;
- percentage who correctly identified the product as a browser for search and tasks;
- Search / Compare / Prepare comprehension rates;
- completion and fallback rates;
- repeat-use intent;
- ordinary-search preference rate;
- Compare-to-Prepare rate;
- Prepare-to-merchant-handoff rate;
- average and p95 task cost by behavior;
- cache or fixture reuse rate;
- model escalation rate;
- retry and failure spend;
- main browser, trust, and usability failures;
- commercial responses and defined result types;
- expected commercial revenue per 100 tasks, if measurable;
- estimated gross contribution per 100 tasks, including failed and abandoned work;
- next 90-day browser, protocol, and commercial milestones.

## Minimum evidence for a focused pre-seed raise

Proceed to a focused raise when most of the following are true:

- public working browser-experience demo;
- at least 20 U.S. participants;
- at least 50 completed or clearly abandoned tasks;
- clear evidence that users understand the product as a browser, not only as a shopping page;
- clear evidence that users understand Search, Compare, Prepare, recommendation reasons, and confirmation boundaries;
- known average and p95 task costs;
- meaningful Prepare and merchant-handoff behavior;
- at least one affiliate, merchant, provider, developer, or strategic-commercial path;
- a plausible result definition and attribution method for the first path;
- credible plan to keep independent ranking separate from commercial systems;
- a specific next browser surface, preferably the extension vertical slice.

## Stop or narrow conditions

Do not raise money to scale the same design when:

- users perceive the product only as a shopping comparison page and do not understand the broader browser behavior;
- users repeatedly prefer ordinary search results for the selected task;
- users cannot explain why an option was recommended;
- users do not trust cross-site preparation or the confirmation boundary;
- the average task cost cannot fit plausible outcome or platform economics;
- live data acquisition requires expensive remote-browser automation for most tasks;
- fewer than 10% of completed comparisons reach a meaningful merchant action after optimization;
- the product needs paid placement to make recommendations or execution work;
- a provider requires private browsing data that the product should not collect;
- the first use case creates unacceptable legal or safety exposure.

A failed shopping wedge does not automatically disprove the AI-browser category. It may mean the first task vertical, data path, interaction, or commercial route should change. Any continuation must be based on measured evidence rather than preserving the original scenario.
