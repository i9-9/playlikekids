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

  return (
    <header
      className={`flex w-full items-start justify-between gap-6 font-roboto text-nav font-bold uppercase tracking-wider ${colorClass} ${className}`}
    >
      <p className="max-w-[20rem] leading-snug md:max-w-none">
        Creative Production Company / Mexico City
      </p>
      <a
        href="mailto:hello@playlikekids.tv"
        className="shrink-0 lowercase tracking-wide"
      >
        hello@playlikekids.tv
      </a>
    </header>
  );
}
