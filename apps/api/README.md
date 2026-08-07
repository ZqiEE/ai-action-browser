# AI Action Browser API

Production runtime for the first free AI browser category. This Worker provides live Web search, provider Offer ingestion, deterministic independent comparison, user-controlled Prepare and Confirm, attribution, and authenticated provider outcome events.

The machine-readable contract is [`openapi.yaml`](openapi.yaml).

## Production guarantees

- Consumer endpoints do not accept commission, bid, partner tier, or expected-revenue inputs.
- Platform Provider administration requires a server-side bearer token that is never shared with Providers.
- Each Provider receives an isolated Offer API token and isolated HMAC webhook signing secret.
- Provider credentials are derived from platform master secrets plus Provider id and credential version; Provider secrets are not stored in D1.
- A Provider can import Offers only for its own Provider id.
- A Provider callback can mutate only outcomes attributed to the same Provider id.
- Provider event ids are idempotent within a Provider, so two Providers may safely use the same local event id.
- Provider credentials can be rotated independently; rotation invalidates the previous Provider API token and signing secret immediately.
- `/v1/prepare` creates the internal attribution record without returning the attribution token or attributed Provider URL.
- The attributed Provider URL is released only by a successful explicit `/confirm` request.
- Public Outcome Receipt responses omit both the attribution token and attributed Provider URL.
- A Provider event cannot create a commercial result before the consumer confirms the handoff.
- Outcome transitions are deterministic and reject invalid rewrites such as `cancelled → completed`.
- Provider Offer links must use HTTPS on the registered Provider hostname or one of its subdomains.
- Search results are limited to public HTTP/HTTPS URLs without embedded credentials.
- JSON bodies and evidence objects have explicit size limits.
- Brave Search and optional OpenAI requests have hard timeouts.
- No production endpoint silently falls back to fixture results.
- OpenAI is optional and is used only for bounded natural-language constraint extraction when configured.
- Responses API requests use `store: false`.
- Important external actions remain unexecuted until the consumer confirms the prepared outcome.

## Required services

- Cloudflare Workers;
- Cloudflare D1;
- Brave Search API for `/v1/search`;
- optional OpenAI API for natural-language constraint extraction;
- at least one real Provider Feed or partner integration.

## Setup

```bash
cd apps/api
npm ci
npx wrangler d1 create ai-action-browser
```

Copy the returned D1 database id into `wrangler.toml`, then configure platform secrets:

```bash
npx wrangler secret put BRAVE_SEARCH_API_KEY
npx wrangler secret put PROVIDER_ADMIN_TOKEN
npx wrangler secret put PROVIDER_WEBHOOK_SECRET
# Optional
npx wrangler secret put OPENAI_API_KEY
```

`PROVIDER_ADMIN_TOKEN` and `PROVIDER_WEBHOOK_SECRET` are platform master secrets. Never send either value to a Provider. The API derives Provider-scoped credentials during onboarding.

Set `OPENAI_MODEL` only when an approved model and budget are configured. Set `ALLOWED_ORIGIN` to a comma-separated list of exact Web application origins.

Apply every database migration:

```bash
npm run db:migrate:remote
```

Validate and deploy:

```bash
npm run typecheck
npm test
npm audit --omit=dev --audit-level=high
npm run deploy
```

## Public endpoints

- `GET /health`
- `POST /v1/search`
- `POST /v1/compare`
- `POST /v1/prepare`
- `POST /v1/outcomes/:outcomeId/confirm`
- `GET /v1/outcomes/:outcomeId`

`POST /v1/prepare` does not return a usable Provider handoff capability. The attributed `continueUrl` appears only after explicit confirmation. `GET /v1/outcomes/:outcomeId` is an auditable receipt and does not return that capability or the internal attribution token.

## Provider onboarding

### 1. Platform administrator creates the Provider

Only the platform uses `PROVIDER_ADMIN_TOKEN`:

```http
POST /v1/providers
Content-Type: application/json
Authorization: Bearer <platform-provider-admin-token>

{
  "id": "provider-example",
  "name": "Example Provider",
  "domain": "provider.example",
  "active": true
}
```

The domain is a hostname only. Do not include a scheme, path, port, or credentials.

The response includes Provider-scoped credentials:

```json
{
  "id": "provider-example",
  "name": "Example Provider",
  "domain": "provider.example",
  "active": true,
  "credentials": {
    "credentialVersion": 1,
    "apiToken": "aab_pat_1_...",
    "webhookSigningSecret": "aab_wh_1_..."
  }
}
```

Deliver only `apiToken` and `webhookSigningSecret` to that Provider through an authenticated secret-sharing channel. The Provider never receives either platform master secret.

### 2. Provider imports its Offers

The Provider uses its own `apiToken`:

```http
POST /v1/providers/provider-example/offers
Content-Type: application/json
Authorization: Bearer <provider-api-token>

{
  "offers": [
    {
      "id": "offer-123",
      "category": "laptop",
      "title": "Laptop model and configuration",
      "description": "Provider-supplied description",
      "price": 949,
      "currency": "USD",
      "availability": "in_stock",
      "deliveryText": "Estimated by Friday",
      "returnsText": "30-day returns",
      "warrantyText": "1-year limited warranty",
      "prepareUrl": "https://provider.example/action/offer-123",
      "sourceUrl": "https://provider.example/products/offer-123",
      "evidence": {
        "sourceType": "provider_feed"
      },
      "retrievedAt": "2026-08-07T12:00:00Z",
      "active": true
    }
  ]
}
```

The token is scoped to `provider-example`; it cannot import Offers for another Provider path. The platform administrator token is also accepted for controlled recovery operations.

`prepareUrl` and `sourceUrl` must use HTTPS and the registered Provider hostname or one of its subdomains. The service rejects unrelated redirect and tracking domains unless they are explicitly registered as part of the Provider domain design.

### 3. Rotate one Provider's credentials

Only the platform administrator can rotate credentials:

```http
POST /v1/providers/provider-example/credentials/rotate
Authorization: Bearer <platform-provider-admin-token>
```

The response contains a higher `credentialVersion` and replacement Provider credentials. Previous Provider credentials become invalid immediately. Rotate only after the Provider is ready to switch both its Offer importer and webhook signer.

## Provider outcome webhook

Providers send JSON to `POST /v1/provider-events` and sign the exact UTF-8 request body with HMAC-SHA256 using their own `webhookSigningSecret`.

Header:

```text
X-AAB-Signature: sha256=<lowercase hex digest>
```

Example body: [`examples/provider-event.json`](examples/provider-event.json).

Generate the exact header locally:

```bash
PROVIDER_WEBHOOK_SIGNING_SECRET='<provider-webhook-signing-secret>' \
  npm run sign:event -- examples/provider-event.json
```

The body format is:

```json
{
  "providerId": "provider-example",
  "eventId": "provider-event-123",
  "attributionToken": "attr_...",
  "status": "completed",
  "occurredAt": "2026-08-07T12:30:00Z",
  "evidence": {
    "providerOrderReference": "ORDER-123"
  }
}
```

`providerId` is part of the signed body. The signature is verified using that Provider's current credential version, and the attribution token must belong to the same Provider. A Provider cannot use its credentials to report another Provider's result.

Allowed Provider statuses are `accepted`, `completed`, `cancelled`, `refunded`, and `disputed`. Provider event ids are idempotent per Provider.

### Outcome state rules

```text
prepared
  └─ consumer confirmation → confirmed

confirmed → accepted | completed | cancelled | disputed
accepted  → completed | cancelled | disputed
completed → refunded | disputed
disputed  → completed | refunded | cancelled
```

`prepared` outcomes reject every Provider result event. `cancelled` and `refunded` are terminal in V1. Cancellation, refund, and dispute events update the same outcome rather than creating a second commercial result.

## Security and contract tests

```bash
npm test
```

The API test suite covers:

- non-HTTPS and cross-domain Offer URLs;
- embedded URL credentials;
- unsafe public search protocols;
- invalid and far-future timestamps;
- oversized evidence;
- Provider events before consumer confirmation;
- invalid commercial state transitions;
- idempotent same-state events;
- Provider credential separation by Provider id, purpose, and credential version;
- rejection of a Provider token used against another Provider or an old credential version.

The Web contract test additionally verifies that the Provider continuation URL is obtained only after confirmation, retained only in the current browser session, and not rendered as an attribution token in the public receipt.

## Not yet production-complete

Deployment still requires real service credentials, a real D1 database id, privacy and terms URLs, operational alerting, rate limits, backups, and at least one signed Provider or affiliate integration. The repository never claims these are active until they are configured and verified.
