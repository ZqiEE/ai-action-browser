# AI Cost Policy v0.1

Status: required for all live experiments.

## Objective

Every user should receive an AI-native experience, but the platform must not repeat expensive reasoning when the underlying evidence has not changed.

The product promise is free consumer access. The engineering requirement is bounded cost per successful task.

## Non-negotiable rules

1. Every production AI request has a monetary budget before execution begins.
2. UI development and automated tests use fixtures by default, not paid model calls.
3. Public evidence is normalized and reused when provider terms allow it.
4. A cached decision may be reused only after freshness checks appropriate to each field.
5. Only changed evidence and user-specific constraints are sent for new reasoning.
6. Strong models are escalation paths, not defaults.
7. Remote browser execution is the last acquisition method, after APIs, feeds, structured data, HTTP retrieval, and search.
8. A task stops when its search, token, browser-time, retry, or monetary budget is exhausted.
9. Failed and abandoned work is included in unit-cost reporting.
10. Commercial relationships never change the independent recommendation order.

## Initial task budgets

These are internal experiment ceilings, not promises to users.

| Task | Target cost | Hard ceiling | Default behavior at ceiling |
| --- | ---: | ---: | --- |
| AI search answer | $0.01 | $0.03 | Return sourced partial answer |
| Product comparison | $0.05 | $0.15 | Reuse verified evidence and disclose missing checks |
| Purchase preparation | $0.15 | $0.50 | Stop before external action and hand off to merchant |
| Complex or ambiguous task | $0.30 | $1.00 | Require an explicit product decision before continuing |

Budgets must be revised from measured data. They are intentionally restrictive during validation.

## Incremental evidence model

Each normalized field stores:

- current value;
- source URL or source identifier;
- source type;
- retrieved timestamp;
- freshness class;
- content or field hash;
- confidence and conflict state;
- decisions that depend on the field.

Suggested freshness classes:

| Evidence | Typical strategy |
| --- | --- |
| Model name and hardware specification | Long cache; low-frequency validation |
| Editorial review conclusions | Check for new sources; do not reprocess unchanged articles |
| Merchant price | Lightweight validation when a comparison is opened |
| Stock status | Validate before Prepare |
| Delivery date | Validate with destination before Prepare |
| Tax and final total | Recalculate immediately before Confirm |
| Merchant domain and action destination | Validate at Confirm |

A changed field triggers only the calculations and explanations that depend on it.

## Model routing

### Deterministic code

Use for calculations, constraints, deduplication, sorting policy, commercial separation, freshness decisions, risk policy, domain matching, and schema validation.

### Low-cost model

Use for intent extraction, condition normalization, short summaries, evidence classification, and simple query rewriting.

### Standard reasoning model

Use for multi-option trade-off analysis, conflicting evidence, and user-facing explanations.

### Strong model

Use only after explicit escalation criteria: unresolved conflict, high-value ambiguity, failed lower-tier attempt, or safety review.

## Required telemetry

Record per task:

- task type and outcome;
- search/data acquisition cost;
- input, cached-input, and output tokens by model;
- model cost;
- browser/proxy duration and cost;
- retries and failure reason;
- cache and incremental-update decisions;
- total task cost;
- whether the user reached Compare, Prepare, merchant click, and confirmed handoff.

Do not store private content merely to measure cost. Use redacted identifiers and aggregated metrics.

## Primary operating metrics

- cost per successful AI search;
- cost per completed comparison;
- cost per Prepare handoff;
- total cost per returning user;
- cache reuse rate;
- percentage of evidence checks that detect a change;
- percentage of tasks escalated to stronger models;
- expected commercial revenue per 100 tasks;
- gross contribution per 100 tasks.

## Kill conditions

Pause expansion if any of the following persists after optimization:

- average task cost exceeds its hard ceiling;
- retries consume more than 20% of AI and browser spend;
- fewer than 10% of completed comparisons reach a merchant action;
- users cannot distinguish independent recommendations from Sponsored content;
- commercial revenue would require changing recommendation order;
- live execution produces unresolved destination, total, or data-sharing uncertainty.
