import {
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export type JsonLd = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

function absoluteUrl(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path}`;
}

export function organizationJsonLd(): JsonLd {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    email: SITE_EMAIL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl(SITE_LOGO_PATH),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mexico City",
      addressCountry: "MX",
    },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
  };
}

export function siteGraphJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), websiteJsonLd()],
  };
}

export function personJsonLd(name: string, slug: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: absoluteUrl(`/directors/${slug}`),
    jobTitle: "Director",
    worksFor: { "@id": ORGANIZATION_ID },
  };
}

export function breadcrumbListJsonLd(
  items: readonly { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function directorsIndexJsonLd(): JsonLd[] {
  return [
    breadcrumbListJsonLd([
      { name: SITE_NAME, path: "/" },
      { name: "Directors", path: "/directors" },
    ]),
  ];
}

export function directorPageJsonLd(name: string, slug: string): JsonLd[] {
  return [
    personJsonLd(name, slug),
    breadcrumbListJsonLd([
      { name: SITE_NAME, path: "/" },
      { name: "Directors", path: "/directors" },
      { name, path: `/directors/${slug}` },
    ]),
  ];
}
