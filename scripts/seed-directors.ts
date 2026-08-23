/**
 * Seeds directors into Sanity once a project + write token exist.
 *
 * Usage:
 *   SANITY_API_TOKEN=... NEXT_PUBLIC_SANITY_PROJECT_ID=... npm run seed
 */
import { createClient } from "@sanity/client";
import { SEED_DIRECTORS } from "../src/lib/sanity/seed-data";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

async function main() {
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
  }
  if (!token) {
    throw new Error("SANITY_API_TOKEN is required (Editor permissions)");
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  for (const director of SEED_DIRECTORS) {
    const docId = `director-${director.slug}`;
    await client.createOrReplace({
      _id: docId,
      _type: "director",
      name: director.name,
      slug: { _type: "slug", current: director.slug },
      order: director.order,
      credits: director.credits.map((credit) => ({
        _type: "credit",
        brand: credit.brand,
        project: credit.project,
        vimeoId: credit.vimeoId ?? undefined,
        vimeoHash: credit.vimeoHash ?? undefined,
      })),
    });
    console.log(`Upserted director: ${director.name}`);
  }

  console.log(
    "Seed complete. In /studio, upload preview images if you want to override the first-film thumbnail.",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
