# 14-Day U.S. Validation Plan

## Decision at the end

After 14 days, decide one of four paths:

1. begin a focused pre-seed raise;
2. continue cost and product optimization;
3. narrow or change the first use case;
4. stop spending on the current direction.

The goal is evidence, not feature completeness.

## Scope freeze

For this validation period:

- market: United States;
- language: U.S. English;
- use case: choosing a laptop under a stated budget;
- product set: 10–30 products;
- merchants: 3–5 sources;
- action boundary: prepare and hand off, not automatic payment;
- participants: at least 20 U.S. consumers;
- completed sessions: at least 50;
- paid model calls: at most one primary reasoning call per completed comparison.

Do not add native apps, a developer marketplace, advertising auctions, unrestricted automation, real payment execution, or additional countries during the test.

## Days 1–2: Publish and instrument

- deploy the existing web prototype;
- verify desktop and mobile routes;
- add a visible demo-data disclosure;
- define task, session, and outcome identifiers;
- implement cost event fields before connecting a live model;
- set daily and per-task spend alerts;
- prepare a short privacy notice for test participants.

Exit condition: a participant can open a public URL and finish the prototype flow without assistance.

## Days 3–4: Prepare the narrow dataset

- select 10–30 representative laptop products;
- normalize price, specification, delivery, return, and warranty fields;
- store source and retrieval timestamps for every field;
- classify fields by freshness risk;
- define incremental update and conflict rules;
- create fixed fallback fixtures for outages and budget exhaustion.

Exit condition: every displayed claim maps to a source or an explicit demo fixture.

## Days 5–6: Add one bounded AI path

- use a low-cost model for condition extraction;
- use deterministic code for filtering and arithmetic;
- allow one reasoning call for trade-off explanation;
- validate model output against a schema;
- refuse unsupported claims;
- log search, model, retry, and total task cost;
- enforce the hard ceilings in `ai-cost-policy.md`.

Exit condition: a complete comparison cannot exceed its configured monetary ceiling.

## Days 7–10: Run user sessions

Recruit at least 20 U.S. participants outside the immediate technical circle.

For each session, record:

- whether the first prompt was understood;
- whether the user selected Search, Compare, or Prepare correctly;
- whether the recommendation reason was understood;
- whether the user noticed uncertainty and sources;
- whether Sponsored content was correctly distinguished;
- whether the user reached the merchant handoff;
- whether the user would use the product again;
- task cost and failures.

Do not coach participants through the interface unless they are completely blocked; observed confusion is data.

## Days 11–12: Commercial signal

- apply to relevant affiliate programs or networks;
- contact at least five merchants, affiliate managers, or commerce partners;
- ask whether they pay for clicks, qualified leads, completed transactions, cashback placements, or structured product feeds;
- document commission ranges and restrictions;
- do not promise paid recommendation placement.

Exit condition: obtain at least one concrete commercial path or clearly document why none is currently accessible.

## Days 13–14: Decide and package evidence

Create a one-page results report containing:

- participant count;
- completed task count;
- completion rate;
- repeat-use intent;
- Compare-to-merchant-handoff rate;
- average and p95 task cost;
- cache or fixture reuse rate;
- model escalation rate;
- main trust failures;
- commercial responses;
- next 90-day budget and milestones.

## Minimum evidence for a focused pre-seed raise

Proceed to a focused raise when most of the following are true:

- public working demo;
- at least 20 U.S. participants;
- at least 50 completed tasks;
- known average and p95 task costs;
- clear evidence that users understand the recommendation;
- meaningful merchant-handoff behavior;
- at least one affiliate, merchant, or strategic-commercial path;
- credible plan to keep independent ranking separate from commercial systems.

## Stop or narrow conditions

Do not raise money to scale the same design when:

- users repeatedly prefer ordinary search results;
- users cannot explain why an option was recommended;
- the average task cost cannot fit plausible advertising or transaction economics;
- live data acquisition requires expensive browser automation for most tasks;
- the product needs paid placement to make recommendations or execution work;
- the first use case creates unacceptable legal or safety exposure.
