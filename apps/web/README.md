# Production V1 Web Surface

Consumer-facing Web surface for the first production category of AI Action Browser.

The application does not contain a production fixture fallback. Live Search, Compare, Prepare, Confirm, attribution, and outcome status are provided by [`../api`](../api). When the API or provider supply is unavailable, the interface reports the failure instead of presenting sample results as live data.

## Product scope

The product category is an **AI browser**. This V1 implements one real bounded task category before the extension and desktop browser shells are built.

The first category is U.S. laptop discovery and provider handoff. It exercises:

- normal Web Search;
- independent provider comparison;
- natural-language constraint extraction;
- evidence and retrieval timestamps;
- explicit Prepare and provider selection;
- destination and data-sharing review;
- user-confirmed attributed handoff;
- provider outcome status and reversal events.

Canonical positioning: [`../../docs/product-positioning.md`](../../docs/product-positioning.md).

## Requirements

- Node.js 22.12 or newer;
- npm 10 or newer;
- a deployed AI Action Browser API;
- `VITE_API_BASE_URL` configured to the exact API origin.

Copy `.env.example` to `.env.local` for local development.

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

- `/` — browser homepage and Omniprompt;
- `/search` — live normal Web Search;
- `/compare` — live independent provider comparison;
- `/confirm` — full-screen provider handoff review;
- `/outcomes/:outcomeId` — auditable outcome receipt and provider event status;
- `/providers` — provider connector and commercial integration contract.

## Production safeguards

- Search remains the default behavior.
- Search, Compare, and Prepare are distinct routes and user choices.
- Production requests never silently fall back to fixtures.
- Commission, bids, partner tier, and expected revenue are absent from comparison requests and database ordering.
- Only active provider Offers can appear in the comparison.
- The provider domain, source URL, retrieval time, amount, shared identifiers, and commercial disclosure are visible before confirmation.
- Confirm creates a user-authorized handoff; it does not submit payment.
- A commercial result requires an authenticated provider event.
- Cancelled, refunded, and disputed events remain part of the same auditable outcome lifecycle.
- Private browsing history, passwords, cookies, and payment credentials are not included in the handoff.

## Test fixtures

Fixtures are allowed only in unit tests, Playwright request interception, and explicit local provider test data. They must never be enabled as an automatic production fallback.

## Remaining launch requirements

The code is not a live production business until all of the following are completed:

- deploy Cloudflare Worker and D1;
- configure Brave Search credentials and spend limits;
- configure exact allowed Web origins;
- create provider administration and webhook secrets;
- connect and verify at least one real provider, network, Feed, sandbox, affiliate approval, or commercial integration;
- publish privacy, terms, provider contract, deletion, and support contacts;
- configure operational monitoring, alerts, incident handling, abuse controls, and backups;
- verify the public Web and API URLs on desktop and mobile.

The extension, current-tab context, unrestricted cross-site automation, automatic payment, account synchronization, and desktop browser shell remain later stages.
