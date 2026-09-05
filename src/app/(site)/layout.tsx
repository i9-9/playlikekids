import { cookies } from "next/headers";
import { SiteShell } from "@/components/sections/SiteShell";
import {
  SITE_PREVIEW_COOKIE,
  isUnderConstruction,
  shouldGatePublicSite,
} from "@/lib/site-mode";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gated = isUnderConstruction()
    ? shouldGatePublicSite((await cookies()).get(SITE_PREVIEW_COOKIE)?.value)
    : false;

  if (gated) return children;

  return <SiteShell>{children}</SiteShell>;
}
