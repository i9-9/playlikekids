/**
 * Public site gate.
 *
 * - `next dev` → full site (unless NEXT_PUBLIC_UNDER_CONSTRUCTION=true)
 * - production build → under construction (unless NEXT_PUBLIC_UNDER_CONSTRUCTION=false)
 *
 * While the gate is on, `/?preview=SITE_PREVIEW_SECRET` unlocks the real site
 * for that browser via an httpOnly cookie. `/?preview=off` locks it again.
 */
export const SITE_PREVIEW_COOKIE = "plk_site_preview";
export const SITE_PREVIEW_QUERY = "preview";

export function isUnderConstruction(): boolean {
  const flag = process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION;

  if (flag === "false") return false;
  if (flag === "true") return true;

  return process.env.NODE_ENV === "production";
}

export function hasSitePreviewAccess(cookieValue: string | undefined): boolean {
  const secret = process.env.SITE_PREVIEW_SECRET;
  return Boolean(secret && cookieValue && cookieValue === secret);
}

export function shouldGatePublicSite(cookieValue: string | undefined): boolean {
  return isUnderConstruction() && !hasSitePreviewAccess(cookieValue);
}
