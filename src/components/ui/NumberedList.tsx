import Link from "next/link";

export type NumberedListItem = {
  number: string;
  label: string;
  href: string;
};

type NumberedListProps = {
  items: NumberedListItem[];
  activeHref?: string;
  className?: string;
};

/** Shared number | name columns so “00 Directors” can sit on the same grid. */
export const numberedListRowClassName =
  "grid w-max max-w-full grid-cols-[var(--list-num)_auto] items-baseline gap-x-[var(--list-gap)]";

export const numberedListTypeClassName =
  "font-roboto text-body font-medium uppercase tracking-wide";

export const numberedListIndentClassName = "w-full pl-[var(--list-indent)]";

export function NumberedListHeading({
  number = "00",
  label = "Directors",
  className = "",
  as: Tag = "h1",
}: {
  number?: string;
  label?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      className={`${numberedListIndentClassName} ${numberedListTypeClassName} ${className}`}
    >
      <span className={`${numberedListRowClassName} font-black`}>
        <span className="tabular-nums">{number}</span>
        <span>{label}</span>
      </span>
    </Tag>
  );
}
export function NumberedList({
  items,
  activeHref,
  className = "",
}: NumberedListProps) {
  return (
    <ol className={`flex flex-col gap-1 ${numberedListTypeClassName} ${numberedListIndentClassName} ${className}`}>
      {items.map((item) => {
        const isActive = activeHref === item.href;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${numberedListRowClassName} ${isActive ? "font-black" : "font-medium"}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="tabular-nums">{item.number}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
