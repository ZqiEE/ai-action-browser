import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";

const filePath = process.argv[2];
const secret = process.env.PROVIDER_WEBHOOK_SIGNING_SECRET;

if (!filePath || !secret) {
  console.error(
    "Usage: PROVIDER_WEBHOOK_SIGNING_SECRET=<provider-secret> npm run sign:event -- path/to/provider-event.json",
  );
  process.exitCode = 1;
} else {
  const body = await readFile(filePath, "utf8");
  try {
    JSON.parse(body);
  } catch {
    console.error("The event file must contain valid JSON.");
    process.exitCode = 1;
  }

  if (process.exitCode !== 1) {
    const digest = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    console.log(`X-AAB-Signature: sha256=${digest}`);
  }
}
