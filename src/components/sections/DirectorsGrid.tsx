import {
  NumberedList,
  NumberedListHeading,
  type NumberedListItem,
} from "@/components/ui/NumberedList";
import {
  DirectorCard,
  type DirectorCardData,
} from "@/components/sections/DirectorCard";

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
      className={`grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] grid-rows-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] gap-y-12 pt-6 md:flex md:flex-col md:gap-y-0 md:pt-14 ${className}`}
    >
      <NumberedListHeading className="col-start-2 row-start-2 w-full shrink-0 md:col-auto md:row-auto md:mb-8" />

      <div className="col-span-3 row-start-3 -mx-gutter flex min-h-0 flex-col md:col-auto md:row-auto md:mx-0 md:flex-1 md:justify-center">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter scroll-px-gutter scrollbar-none md:grid md:grid-cols-5 md:snap-none md:overflow-visible md:px-0 md:scroll-p-0">
          {directors.map((director) => (
            <DirectorCard
              key={director.slug}
              director={director}
              className="w-director shrink-0 snap-start md:w-auto"
            />
          ))}
        </div>
      </div>

      <NumberedList
        items={listItems}
        className="col-start-2 row-start-4 w-full shrink-0 md:col-auto md:row-auto md:mb-10"
      />
    </section>
  );
}
