# Production validation gates

This checklist defines what must pass before the first free AI browser V1 can be merged or deployed.

The product category is the AI browser. U.S. laptop discovery and Provider handoff are the first production task path, not the product definition. Consumer access remains free; Provider payments cannot purchase independent recommendation ranking.

## Automated gates

The API and Web applications install exactly the dependency trees committed in `package-lock.json` using `npm ci`. The browser extension intentionally has no runtime npm dependency tree and is validated with Node built-ins plus Manifest checks.

Changes to this shared checklist must trigger the Production API, Web application, and Browser extension workflows on the same pull-request head so release evidence cannot drift between components.

### Production API

- all committed D1 migrations apply successfully to a clean local database;
- strict TypeScript checking;
- Provider URL, timestamp, evidence-size, signature, confirmation, and outcome-transition tests;
- Provider credential derivation and cross-Provider authorization tests;
- production rate-limit and request-correlation tests;
- Compare has no implicit `laptop` category; `category` is an optional exact Provider-category constraint;
- when `category` is omitted, active Provider Offers are ranked by deterministic relevance to the user goal and explicit constraints, without commercial fields;
- category-neutral relevance tests cover software, laptop, travel, sparse explicit-category queries, and refusal to guess across unrelated supply;
- browser `pageContext` is an optional structured request field rather than text merged into `query`;
- the API re-validates pageContext URL protocol and rejects embedded credentials even if a client bypasses extension-side sanitization;
- the API removes pageContext query parameters and fragments again server-side;
- Search may use sanitized pageContext only for the current upstream discovery request;
- Compare may use sanitized pageContext only for transient relevance matching;
- Compare sends only the user's explicit `query` to model-based constraint extraction;
- Compare persists only the user's explicit `query` in `tasks.query`; pageContext title and URL are not written to the task row;
- Provider Offer delivery, return/refund, and warranty/service text are optional category-specific fields rather than universal requirements;
- the checked-in OpenAPI contract describes category-neutral Compare, transient pageContext, nullable resolved category, optional category-specific Offer terms, every public production route, Provider diagnostics, confirmation capability boundary, and 429/request-correlation behavior;
- production dependency audit with no high-severity findings.

### Web application

- strict TypeScript checking;
- unit tests, including browser-extension context parsing and privacy-bounded URL handling;
- production build with an explicit API origin;
- production dependency audit with no high-severity findings;
- Chromium desktop contract flow;
- WebKit mobile contract flow;
- Search and Compare keep the user's goal unchanged and send current-page metadata in a separate `pageContext` field;
- Compare requests omit category unless a trusted flow explicitly supplies one;
- direct Compare without a goal must not invent a laptop query or start a hidden comparison;
- Compare renders generic Provider category, availability, amount, and only applicable category-specific facts instead of assuming delivery/returns/warranty are universal;
- the extension-context contract proves that `query` remains the original user goal, category is not secretly injected, and pageContext contains only the title plus privacy-bounded URL;
- credentials, query parameters, and fragments must not appear anywhere in the outbound API request.

The Web application uses a small native Hash Router instead of the vulnerable React Router production dependency. Existing public route shapes remain stable:

- `#/`
- `#/search`
- `#/compare`
- `#/confirm`
- `#/providers`
- `#/sources/:sourceId`
- `#/outcomes/:outcomeId`

Malformed encoded dynamic paths must recover to the safe not-found route instead of crashing the application.

### Chrome / Edge browser extension

- Manifest V3 only;
- minimum Chrome version remains explicit and compatible with Side Panel behavior;
- JavaScript syntax checks pass for the service worker, Side Panel, URL-context helper, and explicit page-reader helper;
- extension URL-context and page-reader unit tests pass;
- the Manifest validator rejects any permission expansion beyond `activeTab`, `sidePanel`, and user-invoked `scripting`;
- `host_permissions`, `optional_host_permissions`, persistent content scripts, storage, history, cookies, and persistent tabs access remain absent;
- the current page URL is reduced to `origin + pathname` before task handoff, stripping credentials, query parameters, and fragments;
- disabling current-page metadata removes all `ctx_*` values from the task route;
- current-page metadata values remain in the Hash route rather than the initial HTTP request to the Web host;
- page contents are never read automatically when the Side Panel opens; content extraction requires a separate explicit `Read this page` action;
- explicit page reading is bounded to meta description, H1/H2 headings, user-selected text, and a limited visible-text excerpt;
- page reading removes forms, inputs, textareas, selects, buttons, editable regions, scripts, styles, navigation, headers, and footers from the extracted text source;
- a page containing password, one-time-code, or payment-card fields returns no extracted page content;
- extracted page details are shown in an editable Side Panel preview and are not part of the task until the user explicitly chooses `Add to goal`;
- rich page details are not passed through hidden URL parameters and are not persisted by the extension;
- the resulting task text remains bounded to 1,000 characters before the normal Web/API request budgets apply;
- CI packages an installable `ai-action-browser-extension.zip` artifact after validation.

## Runtime safety gates

- production never substitutes fixture Offers or outcomes;
- Provider source and handoff URLs use HTTPS on the registered Provider domain or its subdomains;
- platform Provider master secrets are never returned to Provider clients;
- each Provider receives credentials scoped to its Provider id and current credential version;
- a Provider API token cannot import Offers for another Provider;
- a Provider webhook signature cannot mutate another Provider's attributed outcome;
- Provider event idempotency is scoped by Provider id;
- rotating one Provider invalidates only that Provider's previous API and webhook credentials;
- Provider diagnostics require a current Provider-scoped credential and never return secrets;
- Provider traffic readiness requires the Provider to be active with at least one fresh active Offer;
- `/v1/prepare` does not expose the attribution token or attributed Provider handoff URL;
- the attributed Provider continuation URL is released only after explicit consumer confirmation;
- the public Outcome Receipt omits the attribution token and Provider continuation URL;
- the Web client keeps a confirmed continuation capability only in the current browser session;
- Provider events are HMAC signed and idempotent;
- Provider events cannot create a result before explicit consumer confirmation;
- cancelled and refunded outcomes cannot be rewritten as completed;
- request bodies, evidence objects, model calls, and search calls are bounded;
- non-health production routes have explicit per-minute request budgets;
- rate-limit storage never stores the raw client IP and uses a window-scoped client hash rather than a stable cross-window pseudonym;
- expired rate-limit buckets are removed by a scheduled Worker cleanup;
- every response receives a request id and rate-limit metadata where applicable;
- structured request logging excludes request bodies, search text, browsing history, Provider secrets, and attribution tokens;
- recommendation queries do not receive commission, bids, partner tier, expected revenue, or a hidden commerce-selected category;
- no relevant cross-category Provider match must produce an empty Compare result rather than an unrelated recommendation;
- browser extension current-page metadata is read only after user invocation, is not persisted by the extension, and can be excluded before starting the task;
- browser pageContext is transient discovery context and must not become durable browsing-history storage through `tasks.query`;
- browser pageContext must not be sent to model constraint extraction;
- browser extension page content is read only after a second explicit action and must be visible/editable before the user can add it to the task;
- browser extension permissions cannot silently expand without failing the checked-in Manifest validation gate;
- production-facing documentation links target stable `main` paths rather than temporary feature branches.

## External launch gates

Automation cannot complete these items without the owner accounts and commercial counterparties:

- create and bind the production D1 database and apply every committed migration;
- configure Cloudflare, Brave Search, Provider administration, and Provider credential master secrets;
- set exact Web/API origins and repository deployment variables;
- establish an authenticated channel for delivering Provider-scoped credentials;
- publish privacy, terms, deletion, and support information;
- configure alert thresholds, backups, incident response, and operational ownership around the existing structured logs and request ids;
- connect at least one real Provider, approved affiliate network, Feed, sandbox, or signed commercial pilot;
- verify that the real Provider passes the authenticated diagnostics endpoint with fresh active Offers;
- verify the laptop path as the first commercial category without reintroducing laptop as an API or browser-core default;
- install the packaged extension in real Chrome and Edge, verify current-page metadata on normal Web pages, and verify no context is available on restricted browser pages;
- inspect production D1 task rows during a browser-context task and verify that page title and page URL are absent from the stored task query;
- verify explicit page reading on ordinary content pages and verify that login, one-time-code, and payment-card pages suppress content extraction;
- verify that extracted details remain visible/editable until the user adds them to the task;
- verify that the extension opens the exact production Web origin and that Search / Compare / Prepare preserve the confirmation boundary;
- verify the deployed desktop and mobile URLs.

The PR remains a launchable codebase, not a claim that these external launch gates are already complete.
