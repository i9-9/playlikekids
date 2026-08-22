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
      <p className="leading-snug">
        <span className="block">Creative Production Company</span>
        <span className="block">Mexico City</span>
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
