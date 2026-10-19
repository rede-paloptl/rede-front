import { createHash } from "node:crypto";
import sharp from "sharp";

/**
 * Imagens de partilha (og:image) comprimidas. O WhatsApp nao mostra imagens
 * pesadas e o painel aceita imagens ate 5 MB, por isso nenhum metadado aponta
 * para o ficheiro original: aponta para uma rota que devolve um JPEG pequeno.
 */

/** "wide" para o cartao grande (site, noticias); "square" para fotos de perfil. */
export type OgImageShape = "wide" | "square";

const sizes: Record<OgImageShape, { width: number; height: number }> = {
  wide: { width: 1200, height: 630 },
  square: { width: 800, height: 800 },
};

/** Segundos durante os quais a imagem pode vir da cache (CDN e crawlers). */
const OG_IMAGE_MAX_AGE = 60 * 60 * 24;

/**
 * Endereco da rota com ?v= tirado da imagem original: quando a imagem muda, o
 * endereco muda, e os crawlers (que guardam a pre-visualizacao) voltam a pedi-la.
 */
export const ogImagePath = (path: string, source: string | undefined) =>
  source ? `${path}?v=${createHash("sha1").update(source).digest("hex").slice(0, 10)}` : undefined;

/** Bloco `images` do openGraph, ou nada se nao houver imagem. */
export const ogImages = (url: string | undefined, alt: string, shape: OgImageShape = "wide") =>
  url ? [{ url, type: "image/jpeg", alt, ...sizes[shape] }] : undefined;

const toJpeg = async (source: string, requestUrl: string, shape: OgImageShape) => {
  try {
    const original = await fetch(new URL(source, requestUrl), { next: { revalidate: OG_IMAGE_MAX_AGE } });

    if (!original.ok) return null;

    const { width, height } = sizes[shape];

    return await sharp(Buffer.from(await original.arrayBuffer()))
      .rotate()
      .resize(width, height, { fit: "cover", position: "attention" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
  } catch {
    return null;
  }
};

/**
 * Resposta da rota: a primeira imagem de `sources` que carregar (URL ou caminho
 * do site, resolvido contra `requestUrl`), em JPEG com o tamanho de `shape`.
 * As seguintes sao recurso (ex: a imagem por omissao do painel) para quando o
 * ficheiro original ja nao existe.
 */
export async function ogImageResponse(
  sources: (string | undefined)[],
  requestUrl: string,
  shape: OgImageShape = "wide",
) {
  for (const source of new Set(sources.filter(Boolean) as string[])) {
    const jpeg = await toJpeg(source, requestUrl, shape);

    if (jpeg) {
      return new Response(new Uint8Array(jpeg), {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": String(jpeg.length),
          "Cache-Control": `public, max-age=${OG_IMAGE_MAX_AGE}, s-maxage=${OG_IMAGE_MAX_AGE}`,
        },
      });
    }
  }

  return new Response(null, { status: 404 });
}
