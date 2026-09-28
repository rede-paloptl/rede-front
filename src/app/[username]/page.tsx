import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { VisitTracker } from "@/components/VisitTracker";
import { AssociatedNews } from "@/components/profile/AssociatedNews";
import { PublicProfile } from "@/components/profile/PublicProfile";
import { SITE_NAME, SITE_URL, toMetaDescription } from "@/lib/site";
import type { User } from "@/types/User";
import { ScrollToTop } from "./ScrollToTop";
import {
  getCityLabel,
  getCountry,
  getDisplayName,
  getProfileHeadline,
  getProfileImage,
  getPublicProfile,
  getSkillLabels,
  normalizeUsername,
  reservedRoutes,
} from "./profile";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

/** Perfil ou null, sem lancar para rotas reservadas ou usernames vazios. */
const loadProfile = async (username: string) => {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || reservedRoutes.has(normalizedUsername)) return null;

  return getPublicProfile(normalizedUsername);
};

const buildDescription = (profile: User) => {
  const displayName = getDisplayName(profile);
  const headline = getProfileHeadline(profile.profileData);
  const bio = toMetaDescription(profile.profileData?.bio);

  if (bio) return bio;

  return toMetaDescription(
    headline
      ? `${displayName} — ${headline}. Perfil profissional na ${SITE_NAME}.`
      : `Perfil profissional de ${displayName} na ${SITE_NAME}.`,
  );
};

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await loadProfile(username).catch(() => null);

  if (!profile) {
    return { title: "Perfil não encontrado", robots: { index: false, follow: true } };
  }

  const displayName = getDisplayName(profile);
  const headline = getProfileHeadline(profile.profileData);
  const title = headline ? `${displayName} — ${headline}` : displayName;
  const description = buildDescription(profile);
  const canonical = `/${normalizeUsername(profile.profileData?.username ?? username)}`;
  const image = getProfileImage(profile);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      locale: "pt_PT",
      images: image ? [{ url: image, alt: `Fotografia de ${displayName}` }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** Dados estruturados (schema.org) para os motores de busca. */
const buildJsonLd = (profile: User, username: string) => {
  const profileData = profile.profileData;
  const url = `${SITE_URL}/${username}`;
  const country = getCountry(profileData?.country);
  const isCompany = profileData?.accountType === "company";

  // So links que apontam para uma conta: "https://www.instagram.com" sozinho nao identifica ninguem.
  const sameAs = Object.entries(profileData?.socialLinks ?? {}).flatMap(([network, link]) => {
    if (typeof link !== "string" || !/^https?:\/\//i.test(link)) return [];

    try {
      const { pathname } = new URL(link);
      return network === "website" || pathname.replace(/\/+$/, "") ? [link] : [];
    } catch {
      return [];
    }
  });

  const skills = getSkillLabels([...(profileData?.coreSkills ?? []), ...(profileData?.skills ?? [])]);
  const city = getCityLabel(profileData?.city);

  const entity = {
    "@type": isCompany ? "Organization" : "Person",
    "@id": `${url}#${isCompany ? "organization" : "person"}`,
    name: getDisplayName(profile),
    ...(!isCompany && profileData?.artisticName && profileData.artisticName !== profile.name
      ? { alternateName: profileData.artisticName }
      : {}),
    ...(isCompany && profileData?.commercialName && profileData.commercialName !== profile.name
      ? { alternateName: profileData.commercialName }
      : {}),
    url,
    image: getProfileImage(profile),
    description: toMetaDescription(profileData?.bio, 300) || undefined,
    ...(!isCompany && profileData?.profession ? { jobTitle: profileData.profession } : {}),
    ...(skills.length ? { knowsAbout: Array.from(new Set(skills)) } : {}),
    ...(city || country
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: city || undefined,
            addressCountry: country?.code ?? country?.name,
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: getDisplayName(profile),
    ...(profile.createdAt ? { dateCreated: profile.createdAt } : {}),
    ...(profile.updatedAt ? { dateModified: profile.updatedAt } : {}),
    mainEntity: entity,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
};

/** Impede que texto do perfil feche a tag <script> do JSON-LD. */
const serializeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await loadProfile(username);

  if (!profile) {
    notFound();
  }

  const normalizedUsername = normalizeUsername(profile.profileData?.username ?? username);

  return (
    <main className="bg-rede-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJsonLd(profile, normalizedUsername)) }}
      />
      <ScrollToTop scrollKey={normalizedUsername} />
      <VisitTracker page="profile" username={normalizedUsername} />
      <TopBar />
      <PublicProfile profile={profile} />
      <AssociatedNews />
      <Footer />
    </main>
  );
}
