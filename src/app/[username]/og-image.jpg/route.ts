import sharp from "sharp";
import { getProfileImage, getPublicProfile, normalizeUsername, reservedRoutes } from "../profile";

/** Lado maximo da imagem partilhada. */
const OG_IMAGE_SIZE = 800;

/** Segundos durante os quais a imagem pode vir da cache (CDN e crawlers). */
const OG_IMAGE_MAX_AGE = 60 * 60 * 24;

type OgImageRouteContext = {
  params: Promise<{ username: string }>;
};

/**
 * Foto do perfil em JPEG pequeno para o og:image. O WhatsApp ignora imagens
 * grandes (os PNG originais chegam aos 2 MB), por isso servimos uma copia
 * reduzida em vez do ficheiro do storage.
 */
export async function GET(_request: Request, { params }: OgImageRouteContext) {
  const username = normalizeUsername((await params).username);

  if (!username || reservedRoutes.has(username)) {
    return new Response(null, { status: 404 });
  }

  try {
    const profile = await getPublicProfile(username);
    const imageUrl = profile ? getProfileImage(profile) : undefined;

    if (!imageUrl) return new Response(null, { status: 404 });

    const source = await fetch(imageUrl, { next: { revalidate: OG_IMAGE_MAX_AGE } });

    if (!source.ok) return new Response(null, { status: 404 });

    const jpeg = await sharp(Buffer.from(await source.arrayBuffer()))
      .rotate()
      .resize(OG_IMAGE_SIZE, OG_IMAGE_SIZE, { fit: "cover", position: "attention", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(jpeg.length),
        "Cache-Control": `public, max-age=${OG_IMAGE_MAX_AGE}, s-maxage=${OG_IMAGE_MAX_AGE}`,
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
