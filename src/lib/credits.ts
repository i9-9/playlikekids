import type { Credit } from "@/lib/sanity/types";

export function formatCreditLabel(credit: Credit): string {
  if (credit.brand && credit.project) {
    return `${credit.brand} — ${credit.project}`;
  }
  return credit.brand || credit.project;
}
