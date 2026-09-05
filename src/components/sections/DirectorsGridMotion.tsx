import {
  DirectorCard,
  type DirectorCardData,
} from "@/components/sections/DirectorCard";

type DirectorsGridMotionProps = {
  directors: DirectorCardData[];
};

export function DirectorsGridMotion({ directors }: DirectorsGridMotionProps) {
  return (
    <>
      {directors.map((director) => (
        <div
          key={director.slug}
          className="w-director shrink-0 snap-start md:w-auto"
        >
          <DirectorCard director={director} />
        </div>
      ))}
    </>
  );
}
