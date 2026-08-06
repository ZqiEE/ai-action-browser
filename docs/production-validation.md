# Production validation gates

This checklist defines what must pass before the first free AI browser V1 can be merged or deployed.

## Automated gates

Both applications install exactly the dependency trees committed in `package-lock.json` using `npm ci`.

### Production API

- strict TypeScript checking;
- provider URL, timestamp, evidence-size, signature, confirmation, and outcome-transition tests;
- production dependency audit with no high-severity findings.

### Web application

- strict TypeScript checking;
- unit tests;
- production build with an explicit API origin;
- production dependency audit with no high-severity findings;
- Chromium desktop contract flow;
- WebKit mobile contract flow.

The Web application uses a small native Hash Router instead of the vulnerable React Router production dependency. Existing public route shapes remain stable:

- `#/`
- `#/search`
- `#/compare`
- `#/confirm`
- `#/providers`
- `#/sources/:sourceId`
- `#/outcomes/:outcomeId`

## Runtime safety gates

- production never substitutes fixture offers or outcomes;
- provider source and handoff URLs use HTTPS on the registered provider domain or its subdomains;
- provider events are HMAC signed and idempotent;
- provider events cannot create a result before explicit consumer confirmation;
- cancelled and refunded outcomes cannot be rewritten as completed;
- request bodies, evidence objects, model calls, and search calls are bounded;
- recommendation queries do not receive commission, bids, partner tier, or expected revenue.

## External launch gates

Automation cannot complete these items without the owner accounts and commercial counterparties:

- create and bind the production D1 database;
- configure Cloudflare, Brave Search, provider administration, and webhook secrets;
- set exact Web/API origins and repository deployment variables;
- publish privacy, terms, deletion, and support information;
- configure rate limits, monitoring, alerts, backups, and incident response;
- connect at least one real provider, approved affiliate network, Feed, sandbox, or signed commercial pilot;
- verify the deployed desktop and mobile URLs.

The PR remains a launchable codebase, not a claim that these external launch gates are already complete.
