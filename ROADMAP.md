# Roadmap

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
- [x] Produce accessibility acceptance checklist.

## Phase 1 — Web Frontend Foundation

Status: implemented on `agent/web-frontend-foundation`; validation pending CI.

Goal: create a production-shaped frontend shell without a real backend.

- [x] Initialize `apps/web` with current stable React, TypeScript strict and Vite;
- [x] Add semantic token layer independent of component framework;
- [x] Add routing for Home, Compare, Source and Confirm pages;
- [x] Add light, dark, forced-colors and reduced-motion support;
- [x] Add shared accessible Button and IconButton primitives;
- [x] Add demonstration data clearly marked as non-live;
- [x] Add not-found route;
- [x] Add component test and end-to-end smoke test;
- [x] Add GitHub Actions typecheck, unit-test, and build validation;
- [ ] Add route-level error boundary;
- [ ] Add general-purpose TextField and Status primitives;
- [ ] Confirm all CI checks pass.

Acceptance:

- Runs without CDN or browser Babel;
- No fixed desktop/mobile artboards;
- TypeScript strict passes;
- 320px through 1440px layouts work without horizontal overflow;
- Keyboard-only flow reaches every core action.

## Phase 2 — Omniprompt Prototype

- [x] Editable multiline input;
- [x] Default Search behavior;
- [x] Compare and Prepare choices;
- [x] Keyboard navigation and Escape behavior;
- [x] Voice and attachment placeholders;
- [x] Reduced-motion alternative;
- [x] Clear normal-search fallback;
- [ ] Intent suggestion based on typed content;
- [ ] Running, paused, stopped, failed and completed task states;
- [ ] Stable sticky transition from homepage to results;
- [ ] Real search-result route distinct from shopping comparison.

Acceptance:

A first-time user understands that the product can search, compare and prepare without needing to understand AI terminology.

## Phase 3 — Shopping Comparison Prototype

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

Acceptance:

A user can explain why the first option is recommended, what its main cost is and which sources support the decision.

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
- [ ] Expired task and changed-destination states.

Acceptance:

Before confirmation, a user can state the destination, amount, recipient, shared data and whether the action can be reversed.

## Phase 5 — Extension Vertical Slice

- [ ] Extension popup with Omniprompt and status;
- [ ] Side Panel for comparison results;
- [ ] `activeTab`-first permission model;
- [ ] Explicit per-site permission education;
- [ ] Prepare action handoff to full web confirmation route;
- [ ] No default `<all_urls>` permission;
- [ ] No high-risk confirmation inside the narrow popup.

## Phase 6 — Rust Core Integration

- [ ] Define TypeScript/Rust boundary;
- [ ] Add Rust/WASM intent and policy prototype;
- [ ] Define task state machine contracts;
- [ ] Define Action DSL schemas in `action-browser-protocol`;
- [ ] Keep model proposal separate from deterministic validation;
- [ ] Enforce recommendation/commercial dependency separation.

## Phase 7 — User Validation

Test with ordinary consumers, beginning with U.S. participants and expanding globally.

Primary questions:

1. Do users understand what they can type on the homepage?
2. Do they recognize when the system suggests Compare or Prepare?
3. Can they explain why a product is recommended?
4. Do they notice Sponsored content without mistaking it for the best result?
5. Before payment, do they understand the destination, amount and shared data?
6. Can they stop or recover a task without losing context?
7. Do U.S. English, price, tax, delivery, and return terms feel natural to U.S. consumers?
8. Does the interface survive translation, RTL, and 200% text zoom without changing the core mental model?

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
- Production merchant verification claims.
