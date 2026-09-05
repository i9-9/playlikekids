/**
 * Ensures every credit in Sanity has a unique `_key` so Studio can edit lists.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/ensure-credit-keys.ts
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

function creditKey() {
  return randomBytes(6).toString("hex");
}

async function main() {
  if (!projectId || !token) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN are required");
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  const docs = await client.fetch<
    Array<{ _id: string; name: string; credits: Array<Record<string, unknown>> | null }>
  >(`*[_type == "director"]{ _id, name, credits }`);

  for (const doc of docs) {
    const credits = doc.credits ?? [];
    const used = new Set(
      credits
        .map((credit) => credit._key)
        .filter((key): key is string => typeof key === "string" && key.length > 0),
    );

    let added = 0;
    const next = credits.map((credit) => {
      const withType =
        credit._type === "credit" ? credit : { ...credit, _type: "credit" };
      if (typeof withType._key === "string" && withType._key.length > 0) {
        return withType;
      }
      let key = creditKey();
      while (used.has(key)) key = creditKey();
      used.add(key);
      added += 1;
      return { ...withType, _key: key };
    });

    if (added === 0) {
      console.log(`${doc.name}: keys ok (${credits.length})`);
      continue;
    }

    await client.patch(doc._id).set({ credits: next }).commit();
    console.log(`${doc.name}: added ${added} _key(s)`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
