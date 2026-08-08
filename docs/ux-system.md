# AI Action Browser UX system

This product uses a browser-first interaction model rather than a marketing-site or chatbot model.

## Reference system

The shell follows mature browser conventions:

- a persistent, visually quiet browser chrome;
- one primary goal field;
- explicit Search / Compare / Prepare modes that do not change themselves;
- stable layouts with no decorative motion;
- side-panel UI that augments the current page instead of becoming a second landing page;
- confirmation pages that resemble browser/security review surfaces rather than checkout marketing.

The browser remains the product. Provider commerce is downstream infrastructure and must not dominate consumer navigation.

## Interaction rules

1. Search is always the default behavior.
2. The browser never changes Search / Compare / Prepare automatically.
3. Mode controls remain visible and in a stable location.
4. Focusing or typing does not open a large menu or move surrounding content.
5. No decorative animation, animated focus lines, hover movement, card lift, pulsing, or auto-rotating content.
6. Loading uses stable text rather than decorative spinners.
7. Provider integration is not a primary consumer navigation item.
8. Important handoffs always use an explicit, visually separate confirmation surface.
9. Current-page context is subordinate to the user goal and can be excluded.
10. Consumer UI says what the browser can do now; it does not present commercial architecture as the main experience.

## Layout hierarchy

### Browser chrome

- 52px persistent top bar.
- AI Action Browser wordmark at left.
- product controls at right only when globally relevant.
- bottom border; no floating marketing header.

### New task

- compact `New task` heading.
- one goal field.
- persistent Search / Compare / Prepare segmented control.
- one Continue button.
- no promotional hero, slogan block, provider sales copy, or example carousel.

### Search

- compact query control at top.
- result count and results list.
- one secondary `Compare` action near the query, not a sticky marketing card.

### Compare

- user goal at top.
- evidence list as the primary surface.
- selected result details in a stable secondary pane on wide screens.
- no demo banners or commercial messaging above the evidence.

### Confirm

- destination, selected result, and data sharing first.
- primary confirmation action remains fixed in the side summary on wide screens.
- commercial disclosure is secondary information.

### Browser side panel

- compact toolbar-like header.
- current page in a single restrained row.
- goal field directly below.
- Search / Compare / Prepare segmented control.
- `Read page` is an explicit utility action, not a large card.
- privacy explanation is concise and subordinate.
