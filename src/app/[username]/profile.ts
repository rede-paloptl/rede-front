import { cache } from "react";
import { getServerApiBaseUrl } from "@/lib/serverApi";
import { ensureTaxonomy, getTaxonomy, type TaxonomyKind } from "@/lib/taxonomy";
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

  // Os nomes (pais, cidade, competencias) vem das listas de Configuracoes.
  await ensureTaxonomy();

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

/** Codigo ISO para o schema.org, pelo slug do termo (o nome pode mudar no painel). */
const countryCodes: Record<string, string> = {
  angola: "AO",
  "cabo-verde": "CV",
  "guine-bissau": "GW",
  mocambique: "MZ",
  "sao-tome-e-principe": "ST",
  "timor-leste": "TL",
};

/** O perfil guarda o id do pais (registos antigos, o nome). */
export const getCountry = (country?: string) => {
  if (!country) return undefined;

  const term = getTaxonomy().find(country, ["country"]);
  return { name: term?.label ?? country, code: term ? countryCodes[term.slug] : undefined };
};

export const getCityLabel = (city?: string) => (city ? getTaxonomy().label(city, ["city"]) : "");

const skillKinds: TaxonomyKind[] = ["profile-category", "profile-subcategory"];

/** Nomes das competencias (o perfil guarda ids). */
export const getSkillLabels = (skills?: string[]) => (skills ?? []).map((skill) => getTaxonomy().label(skill, skillKinds));

/** "Realizadora · Maputo, Moçambique" — so com o que estiver preenchido. */
export const getProfileHeadline = (profileData: ProfileData | null | undefined) => {
  if (!profileData) return "";

  const role = profileData.profession || getSkillLabels(profileData.coreSkills?.slice(0, 2)).join(", ");
  const place = [getCityLabel(profileData.city), getCountry(profileData.country)?.name].filter(Boolean).join(", ");

  return [role, place].filter(Boolean).join(" · ");
};
