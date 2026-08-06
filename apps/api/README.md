# AI Action Browser API

Production runtime for the first free AI browser category. This Worker provides live Web search, provider Offer ingestion, deterministic independent comparison, user-controlled Prepare and Confirm, attribution, and provider outcome events.

## Production guarantees

- Consumer endpoints do not accept commission, bid, partner tier, or expected-revenue inputs.
- Provider administration requires a server-side bearer token.
- Provider outcome events require an HMAC-SHA256 signature.
- No production endpoint silently falls back to fixture results.
- OpenAI is optional and is used only for bounded natural-language constraint extraction when configured.
- Responses API requests use `store: false`.
- Important external actions remain unexecuted until the consumer confirms the prepared outcome.

## Required services

- Cloudflare Workers;
- Cloudflare D1;
- Brave Search API for `/v1/search`;
- optional OpenAI API for natural-language constraint extraction;
- at least one real provider Feed or partner integration.

## Setup

```bash
cd apps/api
npm install
npx wrangler d1 create ai-action-browser
```

Copy the returned D1 database id into `wrangler.toml`, then configure secrets:

```bash
npx wrangler secret put BRAVE_SEARCH_API_KEY
npx wrangler secret put PROVIDER_ADMIN_TOKEN
npx wrangler secret put PROVIDER_WEBHOOK_SECRET
# Optional
npx wrangler secret put OPENAI_API_KEY
```

Set `OPENAI_MODEL` only when an approved model and budget are configured. Set `ALLOWED_ORIGIN` to a comma-separated list of the exact Web application origins.

Apply the database migration:

```bash
npm run db:migrate:remote
```

Validate and deploy:

```bash
npm run typecheck
npm run deploy
```

## Public endpoints

- `GET /health`
- `POST /v1/search`
- `POST /v1/compare`
- `POST /v1/prepare`
- `POST /v1/outcomes/:outcomeId/confirm`
- `GET /v1/outcomes/:outcomeId`

## Provider administration

Send `Authorization: Bearer $PROVIDER_ADMIN_TOKEN`.

### Upsert a provider

```http
POST /v1/providers
Content-Type: application/json

{
  "id": "provider-example",
  "name": "Example Provider",
  "domain": "provider.example",
  "active": true
}
```

### Upsert provider offers

```http
POST /v1/providers/provider-example/offers
Content-Type: application/json

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
      "retrievedAt": "2026-08-06T12:00:00Z",
      "active": true
    }
  ]
}
```

## Provider outcome webhook

Providers send JSON to `POST /v1/provider-events` and sign the exact request body with HMAC-SHA256 using `PROVIDER_WEBHOOK_SECRET`.

Header:

```text
X-AAB-Signature: sha256=<lowercase hex digest>
```

Body:

```json
{
  "eventId": "provider-event-123",
  "attributionToken": "attr_...",
  "status": "completed",
  "occurredAt": "2026-08-06T12:30:00Z",
  "evidence": {
    "providerOrderReference": "ORDER-123"
  }
}
```

Allowed statuses are `accepted`, `completed`, `cancelled`, `refunded`, and `disputed`. Provider event ids are idempotent. Cancellation, refund, and dispute events update the same outcome rather than creating a second commercial result.

## Not yet production-complete

Deployment still requires real service credentials, a real D1 database id, privacy and terms URLs, operational alerting, abuse controls, and at least one signed provider or affiliate integration. The repository never claims these are active until they are configured and verified.
