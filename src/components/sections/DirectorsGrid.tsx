import {
  NumberedList,
  NumberedListHeading,
  type NumberedListItem,
} from "@/components/ui/NumberedList";
import { type DirectorCardData } from "@/components/sections/DirectorCard";
import { DirectorsGridMotion } from "@/components/sections/DirectorsGridMotion";

type DirectorsGridProps = {
  directors: DirectorCardData[];
  className?: string;
};

/**
 * Renders only directors that already have loaded content — no "coming soon" placeholders.
 */
export function DirectorsGrid({
  directors,
  className = "",
}: DirectorsGridProps) {
  const listItems: NumberedListItem[] = directors.map((director) => ({
    number: String(director.order).padStart(2, "0"),
    label: director.name,
    href: `/directors/${director.slug}`,
  }));

  return (
    <section
      className={`grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] grid-rows-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] gap-y-12 pt-6 md:grid-cols-1 md:pt-14 ${className}`}
    >
      <NumberedListHeading className="col-start-2 row-start-2 w-full shrink-0 md:col-start-1" />

      {/* Mobile: keep the slider row at content height so overflowing posters stay tappable, and pad past the footer lockup. */}
      <div className="col-span-3 row-start-3 -mx-gutter flex flex-col pb-[var(--footer-lockup)] md:col-span-1 md:mx-0 md:min-h-0 md:pb-0">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter scroll-px-gutter scrollbar-none md:grid md:grid-cols-5 md:snap-none md:overflow-visible md:px-0 md:scroll-p-0">
          <DirectorsGridMotion directors={directors} />
        </div>
      </div>

      <NumberedList
        items={listItems}
        className="col-start-2 row-start-4 w-full shrink-0 md:col-start-1"
      />
    </section>
  );
}
