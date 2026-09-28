import { cache } from "react";
import { getServerApiBaseUrl } from "@/lib/serverApi";
import type { User } from "@/types/User";

/** Segundos durante os quais a pagina de um perfil pode vir da cache. */
export const PROFILE_REVALIDATE_SECONDS = 60;

export const reservedRoutes = new Set([
  "about",
  "agency",
  "api",
  "confirm-account",
  "film-commission",
  "historico",
  "login",
  "network",
  "news",
  "news-details",
  "newsletter",
  "onboarding",
  "opportunities",
  "opportunity-details",
  "profile",
  "signup",
]);

export const normalizeUsername = (username?: string) => username?.trim().toLowerCase() ?? "";

/**
 * Um perfil publico pelo username. O cache() partilha o mesmo pedido entre
 * generateMetadata e a pagina, por isso a API so e chamada uma vez.
 */
export const getPublicProfile = cache(async (username: string): Promise<User | null> => {
  const response = await fetch(
    `${getServerApiBaseUrl()}/api/v1/users/by-username/${encodeURIComponent(username)}`,
    {
      next: { revalidate: PROFILE_REVALIDATE_SECONDS, tags: [`profile:${username}`] },
      headers: { Accept: "application/json" },
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error("Não foi possível carregar o perfil.");
  }

  const data = await response.json() as { user?: User };
  return data.user ?? null;
});

type ProfileData = User["profileData"];

export const getDisplayName = (profile: User) =>
  profile.name ||
  profile.profileData?.artisticName ||
  profile.profileData?.commercialName ||
  "Perfil";

export const getProfileImage = (profile: User) =>
  profile.profileData?.imageUrl || profile.imageUrl || profile.profileData?.coverImageUrl || undefined;

/** A API guarda os paises sem acentos; para mostrar e para o schema.org. */
const palopCountries: Record<string, { name: string; code: string }> = {
  "Angola": { name: "Angola", code: "AO" },
  "Cabo Verde": { name: "Cabo Verde", code: "CV" },
  "Guine-Bissau": { name: "Guiné-Bissau", code: "GW" },
  "Mocambique": { name: "Moçambique", code: "MZ" },
  "Sao Tome e Principe": { name: "São Tomé e Príncipe", code: "ST" },
  "Timor-Leste": { name: "Timor-Leste", code: "TL" },
};

export const getCountry = (country?: string) =>
  country ? palopCountries[country] ?? { name: country, code: undefined } : undefined;

/** "Realizadora · Maputo, Moçambique" — so com o que estiver preenchido. */
export const getProfileHeadline = (profileData: ProfileData | null | undefined) => {
  if (!profileData) return "";

  const role = profileData.profession || profileData.coreSkills?.slice(0, 2).join(", ");
  const place = [profileData.city, getCountry(profileData.country)?.name].filter(Boolean).join(", ");

  return [role, place].filter(Boolean).join(" · ");
};
