import { festivalTag, preservesBrandCase } from "@/lib/credits";
import type { Credit } from "@/lib/sanity/types";

type CreditLabelProps = {
  credit: Pick<Credit, "brand" | "project" | "festival">;
  showFestival?: boolean;
};

export function CreditLabel({ credit, showFestival = false }: CreditLabelProps) {
  const { brand, project } = credit;
  const keepCase = Boolean(brand && preservesBrandCase(brand));
  const festivalLabel = showFestival ? festivalTag(credit) : null;

  return (
    <>
      {brand ? (
        <span className={keepCase ? "normal-case" : undefined}>
          {keepCase ? brand.toLowerCase() : brand}
        </span>
      ) : null}
      {brand && festivalLabel ? " " : null}
      {festivalLabel}
      {(brand || festivalLabel) && project ? " — " : null}
      {project}
    </>
  );
}
