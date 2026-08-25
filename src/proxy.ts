import { NextResponse, type NextRequest } from "next/server";
import {
  SITE_PREVIEW_COOKIE,
  SITE_PREVIEW_QUERY,
  isUnderConstruction,
  hasSitePreviewAccess,
} from "@/lib/site-mode";

const PREVIEW_COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function stripPreviewParam(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.searchParams.delete(SITE_PREVIEW_QUERY);
  return url;
}

function previewCookieOptions(request: NextRequest) {
  return {
    ...PREVIEW_COOKIE,
    secure: request.nextUrl.protocol === "https:",
  };
}

export function proxy(request: NextRequest) {
  const secret = process.env.SITE_PREVIEW_SECRET;
  const previewParam = request.nextUrl.searchParams.get(SITE_PREVIEW_QUERY);

  if (secret && previewParam === secret) {
    const response = NextResponse.redirect(stripPreviewParam(request));
    response.cookies.set(SITE_PREVIEW_COOKIE, secret, previewCookieOptions(request));
    return response;
  }

  if (previewParam === "off") {
    const response = NextResponse.redirect(stripPreviewParam(request));
    response.cookies.delete(SITE_PREVIEW_COOKIE);
    return response;
  }

  if (!isUnderConstruction() || hasSitePreviewAccess(request.cookies.get(SITE_PREVIEW_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Keep Studio reachable for CMS setup while the public site is gated.
  if (pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  if (pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\..*).*)",
  ],
};
