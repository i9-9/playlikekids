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
 * Heading and numbered roster live in DirectorsRoster (shared with profile pages).
 */
export function DirectorsGrid({
  directors,
  className = "",
}: DirectorsGridProps) {
  return (
    <div className={`flex flex-col md:min-h-0 ${className}`}>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-none md:grid md:grid-cols-5 md:snap-none md:overflow-visible">
        {directors.map((director, index) => (
          <div
            key={director.slug}
            className="w-director shrink-0 snap-start md:w-auto"
          >
            <DirectorCard director={director} priority={index === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
