import { preservesBrandCase } from "@/lib/credits";
import type { Credit } from "@/lib/sanity/types";

type CreditLabelProps = {
  credit: Pick<Credit, "brand" | "project">;
};

export function CreditLabel({ credit }: CreditLabelProps) {
  const { brand, project } = credit;
  const keepCase = Boolean(brand && preservesBrandCase(brand));

  return (
    <>
      {brand ? (
        <span className={keepCase ? "normal-case" : undefined}>
          {keepCase ? brand.toLowerCase() : brand}
        </span>
      ) : null}
      {brand && project ? " — " : null}
      {project}
    </>
  );
}
