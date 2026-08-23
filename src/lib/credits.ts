import type { Credit } from "@/lib/sanity/types";

/** Brands whose stylized casing must survive the credit `uppercase` style. */
const PRESERVE_BRAND_CASE = new Set(["b:oost"]);

export function formatCreditLabel(credit: Pick<Credit, "brand" | "project">): string {
  if (credit.brand && credit.project) {
    return `${credit.brand} — ${credit.project}`;
  }
  return credit.brand || credit.project;
}

export function preservesBrandCase(brand: string): boolean {
  return PRESERVE_BRAND_CASE.has(brand.toLowerCase());
}
