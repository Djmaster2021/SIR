export type Lang = "es" | "en";

// Normalize any incoming lang string into a valid Lang value.
export function normalizeLang(value?: string | null): Lang {
  return value === "en" ? "en" : "es";
}

// Append or replace the lang query param on internal links.
export function withLangParam(href: string, lang: Lang): string {
  if (href.startsWith("#")) return href;

  try {
    const url = new URL(href, "http://internal.local");
    url.searchParams.set("lang", lang);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}
