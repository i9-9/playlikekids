/**
 * Public site gate.
 *
 * - `next dev` → full site (unless NEXT_PUBLIC_UNDER_CONSTRUCTION=true)
 * - production build → under construction (unless NEXT_PUBLIC_UNDER_CONSTRUCTION=false)
 */
export function isUnderConstruction(): boolean {
  const flag = process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION;

  if (flag === "false") return false;
  if (flag === "true") return true;

  return process.env.NODE_ENV === "production";
}
