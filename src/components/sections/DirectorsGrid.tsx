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
    <section className={`flex min-h-0 flex-1 flex-col pt-10 md:pt-14 ${className}`}>
      <NumberedListHeading className="shrink-0" />

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {directors.map((director) => (
            <DirectorCard key={director.slug} director={director} />
          ))}
        </div>
      </div>

      <NumberedList items={listItems} className="mb-8 shrink-0 md:mb-10" />
    </section>
  );
}
