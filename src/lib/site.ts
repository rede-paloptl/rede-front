/** Endereco canonico do site, usado em metadados, sitemap e links partilhados. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://redecinemapaloptl.org").replace(/\/+$/, "");

// Nome e descricao do site: Personalizar > SEO no painel (ver lib/siteSettings.ts).

/** Texto simples com no maximo `max` caracteres, cortado numa palavra. */
export const toMetaDescription = (value: string | undefined | null, max = 160) => {
  const text = (value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= max) return text;

  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
};
