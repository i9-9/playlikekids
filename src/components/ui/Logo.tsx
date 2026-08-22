import type { SVGProps } from "react";

type LogoProps = {
  className?: string;
  /** Visual treatment for light/dark surfaces. */
  variant?: "black" | "white";
} & Omit<SVGProps<SVGSVGElement>, "children">;

/**
 * PLK wordmark lockup without the ® mark.
 * Tipographic SVG so rendering stays crisp at any size.
 */
export function Logo({
  className,
  variant = "black",
  ...props
}: LogoProps) {
  const fill = variant === "white" ? "#ffffff" : "#0a0a0a";

  return (
    <svg
      viewBox="0 0 280 120"
      role="img"
      aria-label="Play Like Kids"
      className={className}
      {...props}
    >
      <text
        x="0"
        y="92"
        fill={fill}
        fontFamily='"Druk Heavy", sans-serif'
        fontSize="96"
        letterSpacing="-2"
      >
        PLK
      </text>
      <text
        x="168"
        y="38"
        fill={fill}
        fontFamily='"Druk Heavy", sans-serif'
        fontSize="22"
        letterSpacing="0.5"
      >
        Play
      </text>
      <text
        x="168"
        y="64"
        fill={fill}
        fontFamily='"Druk Heavy", sans-serif'
        fontSize="22"
        letterSpacing="0.5"
      >
        Like
      </text>
      <text
        x="168"
        y="90"
        fill={fill}
        fontFamily='"Druk Heavy", sans-serif'
        fontSize="22"
        letterSpacing="0.5"
      >
        Kids
      </text>
    </svg>
  );
}
