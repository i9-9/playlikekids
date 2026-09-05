import { ProgressiveInvert } from "@/components/ui/ProgressiveInvert";

type SiteHeaderProps = {
  className?: string;
  /** Inverse colors for dark hero surfaces. */
  tone?: "dark" | "light";
};

export function SiteHeader({
  className = "",
  tone = "dark",
}: SiteHeaderProps) {
  const colorClass = tone === "light" ? "text-background" : "text-foreground";
  const location = (
    <>
      <span className="block">Creative Production Company</span>
      <span className="block">Mexico City</span>
    </>
  );

  return (
    <header
      className={`flex w-full items-start justify-between gap-6 font-roboto text-nav font-bold leading-none tracking-wide ${colorClass} ${className}`}
    >
      <p className="uppercase">
        <ProgressiveInvert
          light={<span>{location}</span>}
          dark={<span className="text-foreground">{location}</span>}
        />
      </p>
      <a
        href="mailto:hello@playlikekids.tv"
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0 lowercase tracking-wide"
      >
        <ProgressiveInvert
          light={<span>hello@playlikekids.tv</span>}
          dark={
            <span className="text-foreground">hello@playlikekids.tv</span>
          }
        />
      </a>
    </header>
  );
}
