export type NewsType = {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string[] | string;
    countries: string[];
    themes?: string[]
    category: string;
    imageUrl?: string;
}

// A lista de notícias vem da API (actions/news.ts): só chegam as publicadas.

export const newsCategories = [
    {
        label: "Cinema",
        value: "cinema",
    },
    {
        label: "Cooperação",
        value: "cooperacao",
    },
    {
        label: "Diversidade",
        value: "diversidade",
    },
    {
        label: "Festivais e Eventos",
        value: "festivais-e-eventos",
    },
    {
        label: "Financiamento",
        value: "financiamento",
    },
    {
        label: "Formação",
        value: "formacao",
    },
    {
        label: "Investigação",
        value: "investigacao",
    },
    {
        label: "Mercado",
        value: "mercado",
    },
    {
        label: "Oportunidades",
        value: "oportunidades",
    },
    {
        label: "Países e Regiões",
        value: "paises-e-regioes",
    },
    {
        label: "Políticas Públicas",
        value: "politicas-publicas",
    },
    {
        label: "Prémios",
        value: "premios",
    },
    {
        label: "Produção Audiovisual",
        value: "producao-audiovisual",
    },
    {
        label: "Projetos da REDE",
        value: "projetos-da-rede",
    },
    {
        label: "Sustentabilidade",
        value: "sustentabilidade",
    },
    {
        label: "Tecnologia",
        value: "tecnologia",
    },
    {
        label: "Televisão e Média",
        value: "televisao-e-media",
    },
];


export const newsSubCategories = {
  cinema: [
    "Animação",
    "Curta-metragem",
    "Documentário",
    "Experimental",
    "Ficção",
    "Longa-metragem",
  ],

  cooperacao: [
    "Camões, I.P.",
    "CPLP",
    "Cultiv’Arte",
    "EUNIC",
    "PALOP+TL",
    "UNESCO",
    "União Europeia",
  ],

  diversidade: [
    "Acessibilidade",
    "Género",
    "Inclusão",
    "Juventude",
    "Línguas Africanas",
  ],

  "festivais-e-eventos": [
    "Conferência",
    "Festival",
    "Fórum",
    "Mercado",
    "Mostra",
    "Pitch",
  ],

  financiamento: [
    "Concursos",
    "Coprodução",
    "Fundos",
    "Investimento",
    "Mecenato",
    "Pitching",
  ],

  formacao: [
    "Bolsas",
    "Capacitação",
    "Masterclasses",
    "Residências Artísticas",
    "Workshops",
  ],

  investigacao: [
    "Dados do Setor",
    "Estatísticas",
    "Estudos",
    "Mapeamento",
    "Publicações",
  ],

  mercado: [
    "Audiências",
    "Distribuição",
    "Exibição",
    "Plataformas",
    "Salas de Cinema",
  ],

  oportunidades: [
    "Bolsa",
    "Casting",
    "Convocatória",
    "Emprego",
    "Estágio",
  ],

  "paises-e-regioes": [
    "Cabo Verde",
    "Diáspora",
    "Guiné-Bissau",
    "Moçambique",
    "Portugal",
    "São Tomé e Príncipe",
    "Timor-Leste",
  ],

  "politicas-publicas": [
    "Debates",
    "Direitos de Autor",
    "Estratégias Nacionais",
    "Film Commission",
    "Incentivos Fiscais",
    "Leis",
    "Regulamentação",
  ],

  premios: [
    "Nomeações",
    "Prémios",
    "Seleção Oficial",
  ],

  "producao-audiovisual": [
    "Argumento",
    "Fotografia",
    "Montagem",
    "Pós-produção",
    "Produção",
    "Realização",
    "Som",
    "VFX",
  ],

  "projetos-da-rede": [
    "Agência de Curtas",
    "Formação Regional",
    "Mapeamento",
    "Observatório",
    "REDE PALOP+TL",
  ],

  sustentabilidade: [
    "Alterações Climáticas",
    "Ambiente",
    "Economia Circular",
    "Green Filming",
  ],

  tecnologia: [
    "Arquivo Digital",
    "Drones",
    "Inteligência Artificial",
    "Realidade Virtual",
    "XR",
  ],

  "televisao-e-media": [
    "Podcast",
    "Rádio Comunitária",
    "Streaming",
    "TV",
    "Websérie",
  ],
};