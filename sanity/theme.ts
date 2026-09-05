import { buildLegacyTheme } from "sanity";

/**
 * Studio tokens mirror `src/app/globals.css` (`:root` color tokens).
 * Keep this map in lockstep when site colors change.
 */
const tokens = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#6b6b6b",
  border: "#e5e5e5",
} as const;

export const studioTheme = buildLegacyTheme({
  "--black": tokens.foreground,
  "--white": tokens.background,
  "--gray": tokens.muted,
  "--gray-base": tokens.muted,
  "--component-bg": tokens.background,
  "--component-text-color": tokens.foreground,
  "--brand-primary": tokens.foreground,
  "--default-button-color": tokens.muted,
  "--default-button-primary-color": tokens.foreground,
  "--main-navigation-color": tokens.background,
  "--main-navigation-color--inverted": tokens.foreground,
  "--focus-color": tokens.foreground,
  "--font-family-base":
    "var(--font-roboto), ui-sans-serif, system-ui, sans-serif",
});
