/**
 * Personalizacao do site, gerida no painel (Personalizar) e lida da API em
 * /api/v1/site-settings. Mesmo formato que o rede-back
 * (modules/site-settings/site-settings.model.ts).
 *
 * `defaultSiteSettings` e copia dos valores por omissao da API: so se usa
 * se a API nao responder (ou faltar algum campo), para o site nunca ficar sem
 * menu nem imagens.
 */

export const siteSettingsSections = [
  "topbar",
  "footer",
  "heroes",
  "home",
  "partners",
  "auth",
  "placeholders",
  "about",
  "seo",
] as const;

export type SiteSettingsSection = (typeof siteSettingsSections)[number];

export type SiteLink = {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
};

export type TopbarSettings = {
  logoUrl: string;
  links: SiteLink[];
};

export const socialNetworks = ["facebook", "instagram", "youtube"] as const;

export type SocialNetwork = (typeof socialNetworks)[number];

export type FooterSettings = {
  menuLinks: SiteLink[];
  contactLinks: SiteLink[];
  /** Vazio: o icone aparece, mas sem link (como estava antes). */
  social: Record<SocialNetwork, string>;
};

export const heroPages = ["about", "agency", "news", "newsletter", "opportunities", "film-commission"] as const;

export type HeroPage = (typeof heroPages)[number];

export type HeroContent = {
  imageUrl: string;
  title: string;
  description: string;
};

export type HeroesSettings = {
  pages: Record<HeroPage, HeroContent>;
  /** Fundo do detalhe de uma noticia ou oportunidade sem imagem propria. */
  fallbackImageUrl: string;
};

export type HomeCard = {
  id: string;
  title: string;
  /** Titulo que aparece ao passar o rato. */
  hoverTitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

export type HomeSettings = {
  /** Sempre dois: o primeiro fica amarelo, o segundo vermelho. */
  cards: HomeCard[];
  newsletterImageUrl: string;
};

export type PartnerLogo = {
  id: string;
  imageUrl: string;
  alt: string;
};

export type PartnerGroup = {
  id: string;
  title: string;
  /** "right" junta-se ao grupo "left" anterior, na mesma linha. */
  side: "left" | "right";
  logos: PartnerLogo[];
};

export type PartnersSettings = {
  groups: PartnerGroup[];
};

/** Fundos das paginas de conta. */
export type AuthSettings = {
  loginImageUrl: string;
  /** Registo, onboarding, confirmar conta e recuperar palavra-passe. */
  signupImageUrl: string;
};

/** Imagens usadas quando um conteudo nao tem imagem propria. */
export type PlaceholdersSettings = {
  newsImageUrl: string;
  opportunityImageUrl: string;
  newsletterImageUrl: string;
  /** Foto de perfil (cartoes da Rede e pagina de perfil). */
  profileImageUrl: string;
  profileCoverUrl: string;
  /** Foto no menu do topo de quem tem sessao iniciada. */
  avatarUrl: string;
  filmCoverUrl: string;
};

/** Documentos da pagina "Sobre nos". */
export type AboutSettings = {
  strategyPdfUrl: string;
  governancePdfUrl: string;
};

export type SeoSettings = {
  siteName: string;
  description: string;
  /** Imagem quando se partilha a home ou uma pagina sem imagem propria. */
  shareImageUrl: string;
  /** Codigo da meta tag do Google Search Console (vazio: sem verificacao). */
  googleSiteVerification: string;
};

export type SiteSettings = {
  topbar: TopbarSettings;
  footer: FooterSettings;
  heroes: HeroesSettings;
  home: HomeSettings;
  partners: PartnersSettings;
  auth: AuthSettings;
  placeholders: PlaceholdersSettings;
  about: AboutSettings;
  seo: SeoSettings;
};

const link = (id: string, label: string, href: string, isVisible = true): SiteLink => ({ id, label, href, isVisible });

export const defaultSiteSettings: SiteSettings = {
  topbar: {
    logoUrl: "/assets/logo-small.png",
    links: [
      link("about", "Sobre nós", "/about"),
      link("network", "REDE", "/network"),
      link("agency", "Agência", "/agency"),
      link("news", "Notícias", "/news"),
      link("opportunities", "Oportunidades", "/opportunities"),
      link("newsletter", "Newsletter", "/newsletter"),
      link("film-commission", "Film Commission", "/film-commission"),
    ],
  },
  footer: {
    menuLinks: [
      link("about", "Sobre nós", "/about"),
      link("network", "REDE", "/network"),
      link("agency", "Agência", "/agency"),
      link("news", "Notícias", "/news"),
      link("opportunities", "Oportunidades", "/opportunities"),
      // A pagina /workshops ainda nao existe: fica escondido ate existir.
      link("workshops", "Workshops", "/workshops", false),
      link("newsletter", "Newsletter", "/newsletter"),
      link("film-commission", "Film Commission", "/film-commission"),
    ],
    contactLinks: [
      link("email", "redecinemapaloptl@gmail.com", "mailto:redecinemapaloptl@gmail.com"),
      link("phone", "+258 849517611", "tel:+258849517611"),
      link("terms", "Termos de utilização", "/assets/termos-de-utilizacao.pdf"),
      link("privacy", "Política de privacidade", "/assets/politica-de-privacidade.pdf"),
    ],
    social: { facebook: "", instagram: "", youtube: "" },
  },
  heroes: {
    pages: {
      about: {
        imageUrl: "/assets/agency/hero.png",
        title: "Sobre nós",
        description:
          "A REDE de Cinema e Audiovisual PALOP+TL é uma iniciativa criada em 2018 por jovens realizadores, produtores e diretores de festivais dos Países Africanos de Língua Oficial Portuguesa. Procuramos formas de contribuir para a melhoria do ecossistema do setor audiovisual destes países, através de ações complementares, com vários focos de atuação.",
      },
      agency: {
        imageUrl: "/assets/agency/hero.png",
        title: "Agência",
        description:
          "A Agência de Curta-metragem PALOP+TL apoia a nova geração do audiovisual, promovendo filmes, criadores e oportunidades que reforçam a colaboração, a mobilidade cultural e a presença internacional das nossas cinematografias.",
      },
      news: {
        imageUrl: "/assets/news/hero.jpg",
        title: "Notícias",
        description:
          "Encontra aqui as últimas notícias sobre as atividades da REDE de Cinema e Audiovisual PALOP+TL e sobre os profissionais, empresas e organizações do setor audiovisual nestes seis países.",
      },
      newsletter: {
        imageUrl: "/assets/newsletter/hero.png",
        title: "Newsletters",
        description: "Acesse todas as edições da nossa newsletter",
      },
      opportunities: {
        imageUrl: "/assets/opportunities/hero.jpg",
        title: "Oportunidades",
        description: "Oportunidades que transformam ideias em projetos sustentáveis.",
      },
      "film-commission": {
        imageUrl: "/assets/film-commission/hero.jpg",
        title: "Film Commission",
        description:
          "Estamos a estudar como pode funcionar um modelo de Film Commission nos PALOP e em Timor-Leste — e a preparar, entretanto, as ferramentas práticas de que o setor precisa.",
      },
    },
    fallbackImageUrl: "/assets/opportunities/hero.jpg",
  },
  home: {
    cards: [
      {
        id: "network",
        title: "REDE",
        hoverTitle: "Explorar a Rede",
        description:
          "Encontra, conecta-te e colabora com profissionais dos PALOP, enquanto aumentas a tua presença na rede — AQUI.",
        imageUrl: "/assets/home/hero-1.png",
        imageAlt: "Profissionais da REDE de Cinema e Audiovisual PALOP e Timor-Leste",
        href: "/network",
      },
      {
        id: "agency",
        title: "Agência",
        hoverTitle: "Explorar a Agência",
        description: "Faz o teu trabalho chegar mais longe, junto de quem o pode projetar e partilhar — AQUI.",
        imageUrl: "/assets/home/hero-2.jpeg",
        imageAlt: "Profissionais da Agência de Cinema e Audiovisual",
        href: "/agency",
      },
    ],
    newsletterImageUrl: "/assets/home/hero-3.png",
  },
  partners: {
    groups: [
      {
        id: "initiative",
        title: "UMA INICIATIVA",
        side: "left",
        logos: [{ id: "museu-cinema", imageUrl: "/assets/partners/museu-cinema.png", alt: "Museu do Cinema" }],
      },
      {
        id: "implementation",
        title: "PARCEIROS DE IMPLEMENTAÇÃO",
        side: "right",
        logos: [
          { id: "ekran-eventos", imageUrl: "/assets/partners/ekran-eventos.png", alt: "Ekran Eventos" },
          { id: "paralax", imageUrl: "/assets/partners/paralax.png", alt: "Paralax" },
          { id: "tela-digital", imageUrl: "/assets/partners/tela-digital.png", alt: "Tela Digital" },
        ],
      },
      {
        id: "camoes",
        title: "FINANCIADO PELA COOPERAÇÃO PORTUGUESA — CAMÕES, I.P.",
        side: "left",
        logos: [
          {
            id: "camoes",
            imageUrl: "/assets/partners/camoes.png",
            alt: "Camões — Instituto da Cooperação e da Língua, I.P.",
          },
        ],
      },
      {
        id: "institutional",
        title: "PARCEIROS INSTITUCIONAIS",
        side: "right",
        logos: [
          { id: "inic", imageUrl: "/assets/partners/inic.png", alt: "INIC" },
          { id: "ministerio-da-cultura", imageUrl: "/assets/partners/ministerio-da-cultura.png", alt: "Ministério da Cultura" },
        ],
      },
      {
        id: "other-funding",
        title: "OUTROS APOIOS FINANCEIROS",
        side: "left",
        logos: [
          { id: "cultivarte", imageUrl: "/assets/partners/cultivarte.png", alt: "Cultiv'Arte" },
          { id: "ministerio-da-educacao", imageUrl: "/assets/partners/ministerio-da-educacao.png", alt: "Ministério da Educação" },
          { id: "uniao", imageUrl: "/assets/partners/uniao.png", alt: "União Europeia" },
          { id: "expertise-france", imageUrl: "/assets/partners/expertise-france.png", alt: "Expertise France" },
        ],
      },
      {
        id: "previous-phases",
        title: "FASES ANTERIORES DESTE PROJECTO TIVERAM APOIO FINANCEIRO",
        side: "left",
        logos: [
          { id: "uniao-europeia", imageUrl: "/assets/partners/uniao-europeia.png", alt: "União Europeia" },
          { id: "palop-tl-ue", imageUrl: "/assets/partners/palop-tl-ue.png", alt: "PALOP-TL UE" },
        ],
      },
      {
        id: "france",
        title: "IMPLEMENTADO COM O APOIO DA EMBAIXADA DE FRANÇA EM MOÇAMBIQUE",
        side: "right",
        logos: [
          { id: "ccfm", imageUrl: "/assets/partners/ccfm.png", alt: "Centro Cultural Franco-Moçambicano" },
          { id: "france-2", imageUrl: "/assets/partners/france-2.png", alt: "França" },
        ],
      },
    ],
  },
  auth: {
    loginImageUrl: "/assets/login/login.png",
    signupImageUrl: "/assets/signup/signup.png",
  },
  placeholders: {
    newsImageUrl: "/assets/home/news/news-1.png",
    opportunityImageUrl: "/assets/opportunities/hero.jpg",
    newsletterImageUrl: "/assets/newsletter.png",
    profileImageUrl: "/assets/profile/profile.png",
    profileCoverUrl: "/assets/profile/hero.png",
    avatarUrl: "/assets/avatar.png",
    filmCoverUrl: "/assets/placeholder-img.jpg",
  },
  about: {
    // O nome do ficheiro tem o acento decomposto (NFD): tem de ficar igual.
    strategyPdfUrl: "/assets/Estrate\u0301gia_C&V_SITE.pdf",
    governancePdfUrl: "/assets/governação_digital_V0_19-07-26_terms.pdf",
  },
  seo: {
    siteName: "Rede Cinema PALOP-TL",
    description:
      "Plataforma da rede de cinema e audiovisual dos países africanos de língua oficial portuguesa e Timor-Leste: profissionais, notícias, oportunidades e agência.",
    shareImageUrl: "/assets/home/hero-1.png",
    googleSiteVerification: "",
  },
};

/**
 * Completa um valor gravado com os valores por omissao: campos que faltam (ex:
 * uma seccao gravada antes de um campo novo existir) ou com o tipo errado
 * ficam com o valor original. Listas vem inteiras do valor gravado.
 */
export function withDefaults<T>(defaults: T, value: unknown): T {
  if (Array.isArray(defaults)) return (Array.isArray(value) ? value : defaults) as T;

  if (defaults !== null && typeof defaults === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return defaults;

    const merged: Record<string, unknown> = { ...(value as Record<string, unknown>) };

    for (const [key, fallback] of Object.entries(defaults)) {
      merged[key] = withDefaults(fallback, (value as Record<string, unknown>)[key]);
    }

    return merged as T;
  }

  return (typeof value === typeof defaults ? value : defaults) as T;
}
