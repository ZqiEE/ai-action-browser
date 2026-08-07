# Web Browser-Experience Prototype

Production-shaped frontend prototype for the AI Action Browser. It uses demonstration data and does not connect to a real search, cross-site execution, merchant, identity, payment, attribution, or settlement service.

## Purpose and product scope

The product category is an **AI browser**.

This Web application validates the browser's Omniprompt, Search / Compare / Prepare behavior, task state, sourced decision interface, commercial separation, and high-risk confirmation model before a browser extension or desktop shell is built.

The included laptop-shopping flow is the first bounded task vertical. It is not the complete product or long-term product category.

Canonical positioning: [`../../docs/product-positioning.md`](../../docs/product-positioning.md).

## Market and language

- Launch market: United States.
- Default product language: U.S. English (`en-US`).
- Demo currency: U.S. dollars.
- Demo commerce conventions: U.S. tax, delivery, return, address, and payment examples.
- Global foundation: locale-aware number/date formatting, Unicode content, responsive system fonts, LTR/RTL direction support, and no country-specific assumptions in browser-level component APIs.

## Requirements

- Node.js 22.12 or newer.
- npm 10 or newer.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Routes

- `/` — browser homepage and Omniprompt.
- `/compare` — first independent task-comparison vertical.
- `/sources/:sourceId` — readable source detail route.
- `/confirm` — independent full-screen high-risk confirmation.

A distinct normal Search result route is still required. Search and Compare must not remain permanently mapped to the same shopping result experience.

## Browser and trust safeguards represented in the prototype

- Search remains the default behavior.
- Compare and Prepare are explicit user choices.
- The system may suggest a behavior but cannot silently escalate it.
- Independent recommendations appear before Sponsored content.
- Sponsored offers can be hidden and cannot purchase the primary recommendation position.
- Prices, availability, merchant status, and delivery dates are clearly labeled as demo data.
- High-risk confirmation is a separate page, not a modal or bottom sheet.
- System verification is simulated only after the user reviews the destination, order or action, delivery, payment, shared data, and commercial disclosure.
- Commercial outcome revenue is not implemented and cannot influence recommendation data.

## Not implemented

- Normal live Web search result route.
- Current-page, tab, or extension context.
- Live search or extraction.
- Cross-site task execution.
- Real merchant or provider integrations.
- Real identity or payment verification.
- Real purchase or other Commit execution.
- Outcome attribution, reversal, dispute, or settlement.
- Account creation or synchronization.
- Production localization content.
- Desktop browser shell.
