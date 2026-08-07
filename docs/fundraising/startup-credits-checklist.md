# Startup Credits Checklist

Verified against official program pages on 2026-08-04. Program terms and amounts can change; recheck immediately before applying.

## Recommended order

1. Google for Startups Cloud — pre-funded Start tier.
2. AWS Activate Founders — self-funded application.
3. Microsoft for Startups — direct application.
4. OpenAI startup benefits — pursue through an eligible VC or program partner.
5. Reapply or upgrade after joining an accelerator or closing institutional funding.

## Shared application package

Prepare these once:

- company or project legal name, if formed;
- founder full name and professional email;
- company-domain email matching the product website where required;
- public product website and demo URL;
- public GitHub repository;
- concise product description identifying the product first as an AI browser;
- description of how AI is foundational to browser search, task understanding, comparison, and action preparation;
- explanation that laptop shopping is the first validation wedge, not the product category;
- explanation of the outcome-funded free-access model and recommendation/commercial separation;
- current company and funding stage;
- incorporation date and country, if applicable;
- cloud billing account identifiers;
- estimated 12-month cloud and model usage;
- architecture summary;
- privacy and data-handling summary;
- expected browser, user-validation, and commercial milestones;
- investor, accelerator, or program referral codes when available.

## Product description

AI Action Browser is a free AI-native web browser that helps ordinary consumers search, understand, compare, and prepare tasks across the web while keeping important external actions under explicit user control. The browser uses normal Search as the default, can gather sourced evidence through Compare, and can prepare cross-site actions before requiring confirmation for payment, sending, submission, deletion, or other high-risk operations.

The first U.S. validation focuses on laptop shopping because it exercises the browser's Search, Compare, Prepare, evidence, confirmation, and merchant-handoff model in one bounded workflow. It is the first validation wedge, not the long-term product boundary.

The planned business model keeps core consumer access free. Commercial beneficiaries can pay for measurable outcomes, clearly separated benefits, or platform services, while independent recommendation ranking remains technically separated from bids, commissions, partner tiers, and expected revenue. The architecture uses incremental evidence updates, deterministic policy enforcement, constrained browser actions, and model routing to keep free access economically sustainable.

Canonical positioning: [`../product-positioning.md`](../product-positioning.md).

## Planned use of credits

- AI inference for intent extraction, query rewriting, evidence classification, and sourced comparison explanations;
- browser task-state, permission, and Action Protocol development;
- normalized evidence storage and change detection;
- cost telemetry and observability by Search, Compare, Prepare, and outcome state;
- public browser-experience prototype hosting;
- limited search and data-acquisition workers;
- security, privacy, confirmation, and abuse controls;
- development and evaluation environments;
- a limited browser-extension vertical slice after Web validation;
- no unrestricted remote-browser fleet, automatic payment, or production outcome settlement during initial validation.

## Google for Startups Cloud

Official program pages:

- https://cloud.google.com/startup
- https://cloud.google.com/startup/faq
- https://cloud.google.com/startup/ai

Current official positioning:

- pre-funded startups with a working MVP can apply for the Start tier;
- the public startup page currently advertises $2,000 for MVP development;
- VC-funded Scale startups can receive larger packages;
- qualifying AI-first Scale startups may receive up to $350,000 over two years;
- the company website domain, business email, and billing details should be aligned;
- third-party marketplace models may not be covered by standard Google Cloud credits.

Application preparation:

- create a Google Cloud account and billing account;
- record the 18-character billing account ID;
- use an email address on the product domain when possible;
- explain why AI is foundational to the browser product, not an optional feature;
- apply to the tier matching the actual funding status;
- do not claim VC funding that does not exist.

## AWS Activate

Official program pages:

- https://aws.amazon.com/startups/credits/
- https://aws.amazon.com/aws-startups/learn/applying-for-aws-activate-credits-a-step-by-step-guide/

Current official positioning:

- Activate Founders is available to eligible self-funded startups;
- the current official page states that Founders starts with $1,000 and selected participants may qualify for up to $5,000;
- provider-backed pre-Series B startups can use an Activate Provider Organization ID for the Portfolio tier;
- the official credit page currently states that Portfolio can provide up to $200,000;
- credits can cover eligible AWS services, including eligible Amazon Bedrock usage.

Application preparation:

- create an AWS Builder ID using a professional email;
- ensure an AWS account is on the required paid tier;
- provide a functioning company website;
- apply to Founders while self-funded;
- ask accelerators, angels, and investors whether they are Activate Providers and can supply an Organization ID.

## Microsoft for Startups

Official program pages:

- https://startups.microsoft.com/
- https://learn.microsoft.com/en-us/azure/signups/startup-help
- https://learn.microsoft.com/en-us/startups/build/azure-getting-started/activate

Current official positioning:

- eligible privately held, for-profit software startups can apply directly;
- eligibility and benefits depend on current program rules and referral status;
- Investor Network referral codes may unlock additional benefits;
- accepted startups activate and manage credits through Microsoft or Azure portals according to their enrollment date.

Application preparation:

- confirm the company satisfies current eligibility rules;
- prepare a Microsoft account and Azure billing identity;
- apply directly through the startup portal;
- enter a valid Investor Network referral code only when one has been provided.

## OpenAI for Startups

Official program page:

- https://openai.com/startups

Current official positioning:

- API credits are primarily unlocked through participating VC partners or eligible startup events;
- the application may require a unique referral code from the VC;
- requested information includes product use, company contacts, funding details, and the OpenAI organization ID.

Application preparation:

- create the OpenAI organization used for development;
- record the organization ID;
- ask every relevant VC or accelerator whether it participates in OpenAI's partner network;
- pursue event and hackathon opportunities where startup credits may be offered;
- do not base the initial runway plan on receiving these credits without a partner path.

## Submission log

| Program | Tier | Submitted | Account/email | Referral | Decision | Credits | Expiration | Notes |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| Google Cloud | Start |  |  |  |  |  |  |  |
| AWS Activate | Founders |  |  |  |  |  |  |  |
| Microsoft for Startups | Direct |  |  |  |  |  |  |  |
| OpenAI for Startups | Partner |  |  |  |  |  |  |  |

## Safety after approval

- configure billing alerts before deploying services;
- set hard quotas where supported;
- track credit expiration dates;
- do not enable automatic high-cost services without an owner and budget;
- calculate the cash-equivalent cost that will begin after credits expire;
- avoid architecture choices that exist only because promotional credits temporarily hide their cost.
