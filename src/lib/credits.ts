import type { Credit } from "@/lib/sanity/types";

/** Brands whose stylized casing must survive the credit `uppercase` style. */
const PRESERVE_BRAND_CASE = new Set(["b:oost"]);

export function festivalTag(
  credit: Pick<Credit, "festival">,
): string | null {
  const festival = credit.festival;
  if (!festival?.name || !festival.year) return null;
  const short = /sundance/i.test(festival.name) ? "Sundance" : festival.name;
  return `(${short} ${festival.year})`;
}

export function formatCreditLabel(
  credit: Pick<Credit, "brand" | "project" | "festival">,
): string {
  const tag = festivalTag(credit);
  const brand = [credit.brand, tag].filter(Boolean).join(" ");
  if (brand && credit.project) {
    return `${brand} — ${credit.project}`;
  }
  return brand || credit.project;
}

export function preservesBrandCase(brand: string): boolean {
  return PRESERVE_BRAND_CASE.has(brand.toLowerCase());
}
