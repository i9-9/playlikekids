import { type DirectorCardData } from "@/components/sections/DirectorCard";
import { DirectorsGridMotion } from "@/components/sections/DirectorsGridMotion";

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
        <DirectorsGridMotion directors={directors} />
      </div>
    </div>
  );
}
