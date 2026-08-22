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

/**
 * Generic numbered list — used on the directors grid and profile sidebar nav.
 */
export function NumberedList({
  items,
  activeHref,
  className = "",
}: NumberedListProps) {
  return (
    <ol className={`flex flex-col gap-1 font-roboto text-body uppercase tracking-wide ${className}`}>
      {items.map((item) => {
        const isActive = activeHref === item.href;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`inline-flex gap-3 ${isActive ? "font-bold" : "font-normal"}`}
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
