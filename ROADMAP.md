# Roadmap

## Product direction

The product category is fixed: **AI browser**.

The implementation sequence is intentionally narrower than the product vision:

1. Web prototype to validate the browser interaction and trust model;
2. one bounded task vertical to validate Search, Compare, Prepare, confirmation, cost, and commercial handoff;
3. browser extension vertical slice to gain current-page, tab, permission, and side-panel context;
4. shared local policy core and Action Protocol;
5. broader task categories and provider integrations;
6. desktop browser shell after the core interaction, trust, and economics are proven.

U.S. laptop shopping is the first validation wedge. It is not the product category or permanent market boundary.

The planned commercial model is outcome-funded free consumer access. Commercial results, Sponsored benefits, and platform services must remain downstream of independent user-first recommendation and browser policy.

Canonical positioning: [`docs/product-positioning.md`](docs/product-positioning.md).

## Phase 0 — Design Freeze

Status: complete

- [x] Freeze visual direction;
- [x] Freeze light and dark color semantics;
- [x] Freeze typography, spacing, radius, border and motion rules;
- [x] Freeze Omniprompt behavior;
- [x] Freeze shopping comparison information architecture;
- [x] Freeze Sponsored separation rules;
- [x] Freeze full-screen high-risk confirmation flow;
- [x] Add six text wireframes;
- [x] Add core interaction specification;
- [x] Define U.S.-first global market requirements;
- [x] Review first-prototype copy for ordinary consumer clarity;
- [x] Produce accessibility acceptance checklist;
- [x] Add initial operating and development cost model;
- [x] Define canonical AI browser positioning and product hierarchy.

## Phase 1 — Web Browser-Experience Foundation

Status: implemented on `agent/web-frontend-foundation`; typecheck, unit tests, and production build pass in CI.

Goal: create a production-shaped browser interaction shell without a real backend or full desktop browser chrome.

- [x] Initialize `apps/web` with current stable React, TypeScript strict and Vite;
- [x] Add semantic token layer independent of component framework;
- [x] Add routing for Home, Compare, Source and Confirm pages;
- [x] Add light, dark, forced-colors and reduced-motion support;
- [x] Add shared accessible Button and IconButton primitives;
- [x] Add demonstration data clearly marked as non-live;
- [x] Add not-found route;
- [x] Add component test and end-to-end smoke test;
- [x] Add GitHub Actions typecheck, unit-test, and build validation;
- [x] Add route-level error boundary;
- [x] Add general-purpose TextField and Status primitives;
- [x] Confirm current CI checks pass.

Acceptance:

- Runs without CDN or browser Babel;
- No fixed desktop/mobile artboards;
- TypeScript strict passes;
- 320px through 1440px layouts work without horizontal overflow;
- Keyboard-only flow reaches every core action;
- First-time users understand that the product is a browser for search and tasks, not a shopping landing page.

## Phase 2 — Omniprompt and Browser Behavior Prototype

- [x] Editable multiline input;
- [x] Default Search behavior;
- [x] Compare and Prepare choices;
- [x] Keyboard navigation and Escape behavior;
- [x] Voice and attachment placeholders;
- [x] Reduced-motion alternative;
- [x] Clear normal-search fallback;
- [x] Deterministic intent suggestion based on typed content without automatic mode switching;
- [x] Running, paused, stopped, failed and completed demonstration states;
- [ ] Stable sticky transition from homepage to results;
- [ ] Real search-result route distinct from shopping comparison;
- [ ] Provider-backed intent classification behind the deterministic policy layer;
- [ ] Current-page and tab-context contract for extension and desktop surfaces;
- [ ] Explicit task permission preview before cross-site Prepare.

Acceptance:

A first-time user understands that the browser can search, compare and prepare tasks without needing to understand AI terminology, and can always continue with ordinary web search.

## Phase 3 — First Task Vertical: Shopping Comparison

- [ ] Full condition editing;
- [x] Removable user conditions;
- [x] One primary recommendation;
- [x] Two compact alternatives;
- [x] Selection and main-choice switching;
- [x] Trade-off disclosure;
- [x] Final-price summary;
- [x] Delivery, return and warranty metadata;
- [x] Source citations, Source Panel, and source route;
- [x] Stale-data and source-conflict presentation;
- [x] Sponsored offer after organic results;
- [x] Hide Sponsored interaction;
- [x] Mobile fixed decision bar;
- [ ] Responsive product imagery and image-source policy;
- [ ] Live search and extraction adapter interfaces;
- [ ] Merchant handoff identifier and privacy-preserving attribution experiment;
- [ ] Measure expected commercial value per 100 browser tasks.

Acceptance:

A user can explain why the first option is recommended, what its main cost is, which sources support the decision, and that this shopping flow is one browser task rather than the whole product.

## Phase 4 — High-Risk Confirmation Prototype

- [x] Independent full-screen Confirm route;
- [x] Destination and connection information;
- [x] Order, Delivery, Payment and Data sharing sections;
- [x] Visible per-section Edit entry points;
- [x] Commercial disclosure;
- [x] Confirm with system-verification simulation;
- [x] Authentication failed state;
- [x] Duplicate-submit prevention;
- [x] Neutral success receipt;
- [x] Mobile fixed action area;
- [ ] Implement per-section Edit flows;
- [ ] Authentication cancelled state;
- [ ] Network failure, price change and merchant rejection states;
- [ ] Expired task and changed-destination states;
- [ ] Generalize the confirmation schema beyond purchases to sending, submitting, signing, posting, and deleting.

Acceptance:

Before confirmation, a user can state the destination, amount or action, recipient, shared data, reversibility, and whether a commercial relationship exists.

## Phase 5 — Browser Extension Vertical Slice

- [ ] Extension popup with Omniprompt and status;
- [ ] Side Panel for comparison and task results;
- [ ] Current-page and selected-tab context;
- [ ] `activeTab`-first permission model;
- [ ] Explicit per-site permission education;
- [ ] Prepare action handoff to full web confirmation route;
- [ ] No default `<all_urls>` permission;
- [ ] No high-risk confirmation inside the narrow popup;
- [ ] Pause, resume, and stop a task while browsing normally;
- [ ] Demonstrate one non-shopping browser task with the same state and permission model.

Acceptance:

The extension behaves as a browser product surface: it can use current-page context, retain a task across navigation, request minimum permissions, and return control to the user before important actions.

## Phase 6 — Rust Core and Action Protocol Integration

- [ ] Define TypeScript/Rust boundary;
- [ ] Add Rust/WASM intent and policy prototype;
- [ ] Define task state machine contracts;
- [ ] Define Action DSL schemas in `action-browser-protocol`;
- [ ] Keep model proposal separate from deterministic validation;
- [ ] Enforce recommendation/commercial dependency separation;
- [ ] Define browser permission, destination, confirmation, and error contracts;
- [ ] Version Search, Compare, Prepare, Confirm, and Commit semantics.

## Phase 7 — Outcome Attribution Experiment

This phase validates the business model without redefining the product as a marketplace.

- [ ] Define qualified handoff and completed-outcome states;
- [ ] Create privacy-preserving task and outcome identifiers;
- [ ] Define attribution windows and duplicate-attribution handling;
- [ ] Record cancellation, refund, reversal, rejection, and dispute states;
- [ ] Define result contracts for the first merchant or provider integration;
- [ ] Keep attribution and settlement data out of independent recommendation inputs;
- [ ] Measure outcome revenue, reversal cost, and gross contribution per 100 tasks;
- [ ] Obtain at least one paid pilot, completed commission path, or written commercial commitment.

Acceptance:

A commercial beneficiary can verify a defined result and its commercial terms without receiving private browsing history or influencing independent ranking.

## Phase 8 — User Validation

Test with ordinary consumers, beginning with U.S. participants and expanding globally.

Primary questions:

1. Do users understand that this is a browser for search and getting things done?
2. Do users understand what they can type on the homepage?
3. Do they recognize when the system suggests Compare or Prepare?
4. Can they explain why a result is recommended?
5. Do they notice Sponsored content without mistaking it for the best result?
6. Before an important action, do they understand the destination, amount or effect, and shared data?
7. Can they stop or recover a task without losing context?
8. Do they prefer the browser workflow over ordinary search for the selected task?
9. Do U.S. English, price, tax, delivery, and return terms feel natural to U.S. consumers?
10. Does the interface survive translation, RTL, and 200% text zoom without changing the core mental model?
11. Can the first commercial path fund tasks without requiring paid recommendation placement?

## Later browser expansion

After the interaction, trust, task reliability, and economics are proven:

- [ ] Desktop browser shell;
- [ ] tab and workspace management designed around tasks;
- [ ] local account, permission, and task-history controls;
- [ ] additional task categories beyond shopping;
- [ ] developer action ecosystem;
- [ ] provider and merchant action interfaces;
- [ ] enterprise administration and private deployment;
- [ ] native mobile browser surfaces where platform policy permits.

## Not in the first prototype

- Real payment execution;
- Password or payment synchronization;
- Automatic purchase without confirmation;
- Finance or medical recommendations;
- Global search index;
- Merchant ad auction platform;
- Full desktop browser shell;
- Native mobile applications;
- Unrestricted site automation;
- Production merchant verification claims;
- Production outcome settlement.

These exclusions limit the first experiment. They do not change the product category: the intended product remains an AI browser.
