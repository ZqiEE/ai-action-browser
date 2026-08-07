# Production validation gates

This checklist defines what must pass before the first free AI browser V1 can be merged or deployed.

## Automated gates

Both applications install exactly the dependency trees committed in `package-lock.json` using `npm ci`.

### Production API

- all committed D1 migrations apply successfully to a clean local database;
- strict TypeScript checking;
- Provider URL, timestamp, evidence-size, signature, confirmation, and outcome-transition tests;
- Provider credential derivation and cross-Provider authorization tests;
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

Malformed encoded dynamic paths must recover to the safe not-found route instead of crashing the application.

## Runtime safety gates

- production never substitutes fixture Offers or outcomes;
- Provider source and handoff URLs use HTTPS on the registered Provider domain or its subdomains;
- platform Provider master secrets are never returned to Provider clients;
- each Provider receives credentials scoped to its Provider id and current credential version;
- a Provider API token cannot import Offers for another Provider;
- a Provider webhook signature cannot mutate another Provider's attributed outcome;
- Provider event idempotency is scoped by Provider id;
- rotating one Provider invalidates only that Provider's previous API and webhook credentials;
- `/v1/prepare` does not expose the attribution token or attributed Provider handoff URL;
- the attributed Provider continuation URL is released only after explicit consumer confirmation;
- the public Outcome Receipt omits the attribution token and Provider continuation URL;
- the Web client keeps a confirmed continuation capability only in the current browser session;
- Provider events are HMAC signed and idempotent;
- Provider events cannot create a result before explicit consumer confirmation;
- cancelled and refunded outcomes cannot be rewritten as completed;
- request bodies, evidence objects, model calls, and search calls are bounded;
- recommendation queries do not receive commission, bids, partner tier, or expected revenue.

## External launch gates

Automation cannot complete these items without the owner accounts and commercial counterparties:

- create and bind the production D1 database and apply every committed migration;
- configure Cloudflare, Brave Search, Provider administration, and Provider credential master secrets;
- set exact Web/API origins and repository deployment variables;
- establish an authenticated channel for delivering Provider-scoped credentials;
- publish privacy, terms, deletion, and support information;
- configure rate limits, monitoring, alerts, backups, and incident response;
- connect at least one real Provider, approved affiliate network, Feed, sandbox, or signed commercial pilot;
- verify the deployed desktop and mobile URLs.

The PR remains a launchable codebase, not a claim that these external launch gates are already complete.
