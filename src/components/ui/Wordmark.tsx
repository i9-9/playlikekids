import type { ComponentPropsWithoutRef } from "react";

type WordmarkProps = {
  children?: string;
  size?: "footer" | "hero";
  className?: string;
} & Omit<ComponentPropsWithoutRef<"span">, "children">;

const sizeClassName: Record<NonNullable<WordmarkProps["size"]>, string> = {
  footer: "text-wordmark-footer",
  hero: "text-wordmark-hero",
};

/**
 * Large Druk Heavy wordmark (footer / protagonist sizes).
 * Navigation behavior is owned by the parent (e.g. SiteFooter wipe).
 */
export function Wordmark({
  children = "Directors",
  size = "footer",
  className = "",
  ...props
}: WordmarkProps) {
  return (
    <span
      className={`font-druk leading-none tracking-normal ${sizeClassName[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
