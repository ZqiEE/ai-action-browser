# Web Frontend Prototype

Production-shaped frontend prototype for the AI Action Browser. It uses demonstration data and does not connect to a real search, merchant, identity, or payment service.

## Market and language

- Launch market: United States.
- Default product language: U.S. English (`en-US`).
- Demo currency: U.S. dollars.
- Demo commerce conventions: U.S. tax, delivery, return, address, and payment examples.
- Global foundation: locale-aware number/date formatting, Unicode content, responsive system fonts, LTR/RTL direction support, and no country-specific assumptions in component APIs.

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

- `/` — consumer homepage and Omniprompt.
- `/compare` — independent shopping comparison.
- `/sources/:sourceId` — readable source detail route.
- `/confirm` — independent full-screen high-risk confirmation.

## Product safeguards represented in the prototype

- Search remains the default behavior.
- Compare and Prepare are explicit user choices.
- Organic recommendations appear before sponsored content.
- Sponsored offers can be hidden and cannot purchase the primary recommendation position.
- Prices, availability, merchant status, and delivery dates are clearly labeled as demo data.
- High-risk confirmation is a separate page, not a modal or bottom sheet.
- System verification is simulated only after the user reviews the destination, order, delivery, payment, shared data, and commercial disclosure.

## Not implemented

- Live search or extraction.
- Real merchant integrations.
- Real identity or payment verification.
- Real purchase execution.
- Account creation or synchronization.
- Production localization content.
