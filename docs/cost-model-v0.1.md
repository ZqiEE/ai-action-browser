# Cost Model v0.1

Date: 2026-08-04

This is a planning model, not a vendor quote. Recheck all rates before committing spend.

## Product assumptions

- Launch market: United States.
- Global-ready architecture, but U.S. English and U.S. commerce flows are validated first.
- One monthly active user performs five meaningful tasks per month.
- One comparison task uses three web-search calls.
- A low-cost model handles most intent, extraction, and summarization work.
- A stronger model is reserved for ambiguous or high-value tasks.
- Ten percent of tasks use a remote browser session averaging two minutes.
- Real payments are not included in the first beta.

## Current vendor reference rates

- Cloudflare Workers Paid: minimum $5/month, including 10 million requests and 30 million CPU milliseconds before overage.
- Cloudflare R2 Standard: $0.015/GB-month, with no Internet egress charge.
- Brave Search API: $5 per 1,000 search requests, with $5 monthly free credit.
- OpenAI GPT-5.6 Luna standard short-context text pricing: $0.10 per million input tokens and $0.60 per million output tokens.
- Browserbase Developer: $20/month with 100 browser hours; Startup: $99/month with 500 browser hours, with usage overages and proxy/fetch charges applying separately.

Official references:

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://api-dashboard.search.brave.com/documentation/pricing
- https://developers.openai.com/api/docs/pricing
- https://www.browserbase.com/pricing

## Estimated variable cost per comparison task

Example task:

- Three Brave search calls: about $0.015.
- 12,000 model input tokens plus 2,000 output tokens on GPT-5.6 Luna: about $0.0024.
- Remote browser allowance, averaged across all tasks when only 10% require it: generally below $0.005 before proxy and fetch charges.
- Storage and edge compute: usually below $0.001 at early scale.

Core technical cost is therefore approximately $0.02 per task before retries, stronger-model routing, observability, abuse, and failed automation. Use a planning range of **$0.025–$0.05 per meaningful task**.

## Monthly operating scenarios

| Scenario | MAU | Tasks/month | Core vendor estimate | Safer monthly budget |
| --- | ---: | ---: | ---: | ---: |
| Private alpha | 100 | 500 | $15–$40 | $50–$150 |
| Early U.S. beta | 1,000 | 5,000 | $125–$250 | $200–$500 |
| Product validation | 10,000 | 50,000 | $1,250–$2,500 | $1,500–$4,000 |
| Early scale | 100,000 | 500,000 | $12,500–$25,000 | $15,000–$35,000 |

The safer budget adds monitoring, email, authentication, retries, source extraction, proxies, support tooling, and unexpected traffic.

## One-time and annual launch costs

These are planning assumptions, not market quotes.

- Company formation, contracts, privacy policy, terms, affiliate agreements: $10,000–$50,000.
- Security review and penetration testing before handling sensitive actions: $15,000–$75,000.
- Test devices, accessibility testing, and U.S. user research: $10,000–$50,000.
- Brand, copy, and product-design support beyond the current prototype: $10,000–$50,000.
- Contingency for merchant integration and anti-fraud work: $20,000–$100,000.

## Development budget ranges

### Founder-built validation

- Cash budget: **$5,000–$30,000** to reach a controlled U.S. beta, excluding the founder's time.
- Appropriate when real purchasing is not yet executed and automation is limited to a small supported site set.

### Lean professional team

- Cash budget: **$200,000–$600,000** for a credible beta with web, extension, Rust policy core, cloud services, security review, and U.S. user testing.
- Assumes a small team or contractors over several months.

### Production U.S. launch

- First-year budget: **$1.2M–$3M** for engineering, product, security, legal, support, infrastructure, merchant relationships, and reliability work.
- A browser that performs real high-risk actions should not be launched as a normal lightweight consumer web app.

## Cost controls that must be built in

1. Search remains free and simple when AI work is unnecessary.
2. Cache normalized search and merchant evidence without storing private user data.
3. Route most tasks to rules or low-cost models.
4. Use stronger models only when quality thresholds require them.
5. Do not launch a remote browser for tasks that can be completed by search, feeds, or APIs.
6. Set per-task search, token, browser-time, and retry budgets.
7. Stop work when the user leaves or cancels.
8. Apply hard account and provider spend limits.
9. Separate anonymous free usage from abuse-prone automation limits.
10. Measure cost per successful decision and cost per completed conversion, not only cost per request.
