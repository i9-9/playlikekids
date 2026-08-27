/**
 * Seeds directors and the home hero into Sanity.
 *
 * Usage:
 *   npm run seed
 *
 * Loads `.env.local` (see the `seed` script in package.json).
 */
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { LOCAL_HERO_IMAGES, SEED_DIRECTORS } from "../src/lib/sanity/seed-data";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

const HERO_DOC_ID = "home-hero";

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
        festival: credit.festival ?? undefined,
      })),
    });
    console.log(`Upserted director: ${director.name}`);
  }

  const heroImages = await Promise.all(
    LOCAL_HERO_IMAGES.map(async (frame, index) => {
      const filePath = path.join(
        process.cwd(),
        "public",
        frame.url.replace(/^\//, ""),
      );
      const asset = await client.assets.upload(
        "image",
        createReadStream(filePath),
        { filename: path.basename(filePath) },
      );
      console.log(`Uploaded hero frame: ${path.basename(filePath)}`);
      return {
        _type: "image" as const,
        _key: `hero-frame-${index + 1}`,
        asset: {
          _type: "reference" as const,
          _ref: asset._id,
        },
        alt: frame.alt,
      };
    }),
  );

  await client.createOrReplace({
    _id: HERO_DOC_ID,
    _type: "hero",
    title: "Home Hero",
    images: heroImages,
  });
  console.log("Upserted Home Hero");

  console.log(
    "Seed complete. In /studio, upload director preview images if you want to override the first-film thumbnail.",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
