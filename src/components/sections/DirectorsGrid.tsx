import { NumberedList, type NumberedListItem } from "@/components/ui/NumberedList";
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
    <section className={`flex flex-col gap-10 ${className}`}>
      <div className="flex items-end justify-between gap-4 font-roboto text-meta uppercase tracking-wider">
        <span>00</span>
        <span>Directors</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {directors.map((director) => (
          <DirectorCard key={director.slug} director={director} />
        ))}
      </div>

      <NumberedList items={listItems} className="max-w-md sm:ml-[20%]" />
    </section>
  );
}
