import type { MetadataRoute } from "next";
import { getServerApiBaseUrl } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { User } from "@/types/User";
import { normalizeUsername, reservedRoutes } from "./[username]/profile";

// Regenerado no maximo de hora a hora.
export const revalidate = 3600;

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/network", priority: 0.9, changeFrequency: "daily" },
  { path: "/news", priority: 0.8, changeFrequency: "daily" },
  { path: "/opportunities", priority: 0.8, changeFrequency: "daily" },
  { path: "/agency", priority: 0.7, changeFrequency: "weekly" },
  { path: "/newsletter", priority: 0.6, changeFrequency: "weekly" },
  { path: "/film-commission", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
];

/** Perfis publicos (a API so devolve os visiveis). Sem API, o sitemap sai so com as paginas fixas. */
const getProfileEntries = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/v1/users`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const data = await response.json() as { users?: User[] };
    const seen = new Set<string>();

    return (data.users ?? []).flatMap((user) => {
      const username = normalizeUsername(user.profileData?.username);
      if (!username || reservedRoutes.has(username) || seen.has(username)) return [];
      seen.add(username);

      return [{
        url: `${SITE_URL}/${encodeURIComponent(username)}`,
        lastModified: user.updatedAt ? new Date(user.updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }];
    });
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...(await getProfileEntries()),
  ];
}
