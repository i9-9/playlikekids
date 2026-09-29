/**
 * Public site gate. The live site is public unless
 * NEXT_PUBLIC_UNDER_CONSTRUCTION=true.
 *
 * While the gate is on, `/?preview=SITE_PREVIEW_SECRET` unlocks the real site
 * for that browser via an httpOnly cookie. `/?preview=off` locks it again.
 * Public indexing (robots, sitemap, meta) stays off while the flag is true.
 */
export const SITE_PREVIEW_COOKIE = "plk_site_preview";
export const SITE_PREVIEW_QUERY = "preview";

export function isUnderConstruction(): boolean {
  return process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === "true";
}

export function hasSitePreviewAccess(cookieValue: string | undefined): boolean {
  const secret = process.env.SITE_PREVIEW_SECRET;
  return Boolean(secret && cookieValue && cookieValue === secret);
}

export function shouldGatePublicSite(cookieValue: string | undefined): boolean {
  return isUnderConstruction() && !hasSitePreviewAccess(cookieValue);
}
