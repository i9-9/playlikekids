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
      className={`flex w-full items-start justify-between gap-6 font-roboto text-nav font-bold leading-none tracking-wide ${colorClass} ${className}`}
    >
      <p className="uppercase">
        <span className="block">Creative Production Company</span>
        <span className="block">Mexico City</span>
      </p>
      <a
        href="mailto:hello@playlikekids.tv"
        className="block shrink-0 lowercase tracking-wide"
      >
        hello@playlikekids.tv
      </a>
    </header>
  );
}
