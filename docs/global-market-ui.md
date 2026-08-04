# Global Market UI Requirements

Status: baseline for the first web prototype.

## Product market decision

The product is designed for people worldwide. The first launch and validation market is the United States.

This means the first version should feel native and immediately understandable to an ordinary U.S. consumer without turning U.S. conventions into permanent technical assumptions.

## U.S. launch defaults

- Default locale: `en-US`.
- Primary language: plain U.S. English.
- Default currency in demos: USD.
- First shopping examples: U.S. merchants, taxes, delivery expectations, return language, addresses, and payment terminology.
- Primary timezone for merchant demonstrations: derived from the user or destination, never hard-coded to one U.S. timezone.
- Measurements: show the locally expected unit and preserve a path for conversion.
- Dates: format through the active locale rather than storing presentation strings.

## Global requirements from the first commit

1. Components receive semantic values, not preformatted U.S.-specific strings.
2. Currency uses `Intl.NumberFormat` with an explicit currency code.
3. Dates use `Intl.DateTimeFormat` and machine-readable timestamps.
4. The document language and direction are set independently.
5. Layouts support both LTR and RTL through logical CSS properties.
6. Text containers expand for translation and 200% text zoom.
7. Names, addresses, phone numbers, and postal codes are not constrained to U.S. shapes in shared component APIs.
8. System fonts provide broad script coverage for Latin, CJK, and Arabic text.
9. Icons, color, and position are never the only way to communicate meaning.
10. Commercial disclosures and confirmation language remain readable at 14px or larger.

## Copy principles for U.S. consumers

- Use everyday verbs: Search, Compare, Prepare, Review, Confirm, Stop, Cancel.
- Avoid unexplained AI terminology, agent terminology, model names, and implementation details.
- Do not use exaggerated claims such as best, verified, secure, or trusted unless the product has evidence for the exact claim.
- State what will happen before asking for permission.
- State what did not happen after a demo or failed operation.
- Show the destination, total amount, shared information, and ability to reverse an action in direct language.

## Localization sequence after U.S. validation

1. Spanish for U.S. users (`es-US`).
2. Spanish for Mexico (`es-MX`) and French for Canada (`fr-CA`).
3. German, Japanese, Korean, and Simplified Chinese.
4. Arabic with full RTL usability review.
5. Market-specific commerce, privacy, tax, accessibility, and consumer-protection review before enabling live actions.

Translation alone is not sufficient. Each market requires local review of merchant terminology, consent, privacy disclosures, payment expectations, address formats, units, dates, and cancellation rights.
