export const locales = ["en", "de", "fr", "hi"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "de" || value === "fr" || value === "hi";
}

export const defaultLocale: Locale = "en";

/** First path segment after `/:lang`; falls back when URL has no locale (e.g. `/`). */
export function pathnameLocale(pathname: string): Locale {
  const seg = pathname.split("/").filter(Boolean)[0];
  return isLocale(seg) ? seg : defaultLocale;
}

export const routeSlug = {
  about: { en: "about", de: "uber", fr: "about", hi: "about" },
  work: { en: "work", de: "projekte", fr: "work", hi: "work" },
} as const;

export function aboutSegment(locale: Locale): string {
  return routeSlug.about[locale];
}

export function workSegment(locale: Locale): string {
  return routeSlug.work[locale];
}

export function hrefAbout(locale: Locale): string {
  return `/${locale}/${aboutSegment(locale)}`;
}

export function hrefWork(locale: Locale, projectSlug: string): string {
  return `/${locale}/${workSegment(locale)}/${projectSlug}`;
}

export function hrefHome(locale: Locale): string {
  return `/${locale}`;
}

export function hrefWriting(locale: Locale, slug: string): string {
  return `/${locale}/writing/${slug}`;
}
