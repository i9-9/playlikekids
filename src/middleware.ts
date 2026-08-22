import { NextResponse, type NextRequest } from "next/server";
import { isUnderConstruction } from "@/lib/site-mode";

export function middleware(request: NextRequest) {
  if (!isUnderConstruction()) {
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
