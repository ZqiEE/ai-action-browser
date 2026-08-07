# AI Action Browser Extension

This directory contains the first installable Chrome/Edge browser surface for AI Action Browser.

It is not a shopping extension. It is a browser-level entry point for the product's Search → Compare → Prepare behavior while the user remains on the page they are using.

## Product behavior

The toolbar action opens a browser Side Panel. From the Side Panel the user can:

- see the title and hostname of the current active Web page;
- decide whether the current page title and URL should be used as task context;
- enter a goal;
- explicitly choose Search, Compare, or Prepare;
- open the corresponding AI Action Browser task in a new tab without replacing the current page.

The current U.S. laptop category remains the first supported Compare/Prepare task category. The extension itself is category-neutral.

## Privacy boundary

The first extension release deliberately requests only:

- `activeTab`: temporary access to the page the user invoked the extension from;
- `sidePanel`: the browser Side Panel surface.

It does **not** request:

- browsing history;
- persistent `tabs` access;
- cookies;
- storage;
- host permissions;
- content scripts;
- page-body extraction;
- passwords, payment data, or browser credentials.

The extension reads only the active tab title and URL after user invocation. It does not persist that context. When the user elects to include context, the title and URL are added to the application's Hash route. URL fragments are not included in the initial HTTP request to the Web host. The Web application then explicitly decides what bounded context is sent to Search or Compare.

## Local installation

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select this `apps/extension` directory.
5. Pin **AI Action Browser** and click it from a normal HTTP/HTTPS page.

Chrome 116 or newer is required for `openPanelOnActionClick`.

## Validation

From the repository root:

```bash
node --check apps/extension/service-worker.js
node --check apps/extension/sidepanel.js
node --check apps/extension/lib/context.mjs
node apps/extension/scripts/validate-manifest.mjs
node --test apps/extension/tests/*.test.mjs
```

CI also packages the extension into a ZIP artifact after these checks pass.

## Release boundary

The extension does not bypass the Web application's confirmation boundary. Prepare still stops before the important Provider handoff, and the attributed continuation URL is released only after explicit confirmation in the trusted task flow.
