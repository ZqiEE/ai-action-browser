import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(here, "../manifest.json"), "utf8"));

assert.equal(manifest.manifest_version, 3, "Manifest V3 is required.");
assert.equal(manifest.minimum_chrome_version, "116", "The side-panel behavior requires Chrome 116+.");
assert.deepEqual(
  [...manifest.permissions].sort(),
  ["activeTab", "sidePanel", "scripting"].sort(),
  "Extension permissions must remain limited to user-invoked active-tab access, the side panel, and explicit page scripting.",
);
assert.equal("host_permissions" in manifest, false, "Host permissions are forbidden in the first browser extension release.");
assert.equal("optional_host_permissions" in manifest, false, "Optional host permissions are forbidden in the first browser extension release.");
assert.equal("content_scripts" in manifest, false, "Persistent content scripts are forbidden in the first browser extension release.");
assert.equal(manifest.background?.service_worker, "service-worker.js");
assert.equal(manifest.background?.type, "module");
assert.equal(manifest.side_panel?.default_path, "sidepanel.html");
assert.equal(manifest.content_security_policy?.extension_pages, "script-src 'self'; object-src 'self'");

console.log("Extension manifest privacy and runtime contract OK");
