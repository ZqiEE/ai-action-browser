# Roadmap

## Phase 0 — Design Freeze

Status: in progress

- [x] Freeze visual direction;
- [x] Freeze light and dark color semantics;
- [x] Freeze typography, spacing, radius, border and motion rules;
- [x] Freeze Omniprompt behavior;
- [x] Freeze shopping comparison information architecture;
- [x] Freeze Sponsored separation rules;
- [x] Freeze full-screen high-risk confirmation flow;
- [x] Add six text wireframes;
- [x] Add core interaction specification;
- [ ] Review all copy for global consumer clarity;
- [ ] Produce accessibility acceptance checklist.

## Phase 1 — Web Frontend Foundation

Goal: create a production-shaped frontend shell without a real backend.

- [ ] Initialize `apps/web` with current stable React, TypeScript strict and Vite;
- [ ] Add semantic token layer independent of component framework;
- [ ] Add routing for Home, Compare, Source and Confirm pages;
- [ ] Add light, dark, forced-colors and reduced-motion support;
- [ ] Add shared accessible Button, IconButton, TextField and Status components;
- [ ] Add demonstration data clearly marked as non-live;
- [ ] Add error boundary and not-found route;
- [ ] Add component tests and end-to-end smoke tests.

Acceptance:

- Runs without CDN or browser Babel;
- No fixed desktop/mobile artboards;
- TypeScript strict passes;
- 320px through 1440px layouts work without horizontal overflow;
- Keyboard-only flow reaches every core action.

## Phase 2 — Omniprompt Prototype

- [ ] Editable multiline input;
- [ ] Default Search behavior;
- [ ] Compare and Prepare suggestions;
- [ ] Keyboard navigation and Escape behavior;
- [ ] Voice/image/attachment placeholders;
- [ ] Running, paused, stopped, failed and completed states;
- [ ] Stable sticky transition from homepage to results;
- [ ] Reduced-motion alternative;
- [ ] Clear normal-search fallback.

Acceptance:

A first-time user understands that the product can search, compare and prepare without needing to understand AI terminology.

## Phase 3 — Shopping Comparison Prototype

- [ ] Editable user conditions;
- [ ] One primary recommendation;
- [ ] Two compact alternatives;
- [ ] Selection and main-choice switching;
- [ ] Trade-off disclosure;
- [ ] Final-price summary;
- [ ] Delivery, return and warranty metadata;
- [ ] Source citations and Source Panel;
- [ ] Stale-data and source-conflict states;
- [ ] Sponsored offer after organic results;
- [ ] Hide Sponsored interaction;
- [ ] Mobile fixed decision bar.

Acceptance:

A user can explain why the first option is recommended, what its main cost is and which sources support the decision.

## Phase 4 — High-Risk Confirmation Prototype

- [ ] Independent full-screen Confirm route;
- [ ] Destination and connection information;
- [ ] Order, Delivery, Payment and Data sharing sections;
- [ ] Per-section Edit flow;
- [ ] Commercial disclosure;
- [ ] Confirm with system-verification simulation;
- [ ] Authentication cancelled and failed states;
- [ ] Network failure, price change and merchant rejection states;
- [ ] Duplicate-submit prevention;
- [ ] Neutral success receipt;
- [ ] Mobile fixed action area.

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

Test with ordinary consumers, not only technical users.

Primary questions:

1. Do users understand what they can type on the homepage?
2. Do they recognize when the system suggests Compare or Prepare?
3. Can they explain why a product is recommended?
4. Do they notice Sponsored content without mistaking it for the best result?
5. Before payment, do they understand the destination, amount and shared data?
6. Can they stop or recover a task without losing context?

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
