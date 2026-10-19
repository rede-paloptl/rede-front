import { ogImageResponse } from "@/lib/ogImage";
import { ensureSiteSettings } from "@/lib/siteSettings";
import { getProfileImage, getPublicProfile, normalizeUsername, reservedRoutes } from "../profile";

type OgImageRouteContext = {
  params: Promise<{ username: string }>;
};

/** Foto do perfil (ou a foto por omissao do painel) em JPEG pequeno, para o og:image. */
export async function GET(request: Request, { params }: OgImageRouteContext) {
  const username = normalizeUsername((await params).username);

  if (!username || reservedRoutes.has(username)) {
    return new Response(null, { status: 404 });
  }

  const profile = await getPublicProfile(username).catch(() => null);

  if (!profile) return new Response(null, { status: 404 });

  const { placeholders } = await ensureSiteSettings();

  return ogImageResponse([getProfileImage(profile), placeholders.profileImageUrl], request.url, "square");
}
