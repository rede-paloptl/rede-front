export type NewsType = {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string[] | string;
    /** Ids dos países (lista de Configurações). */
    countries: string[];
    /** Nomes dos temas (a API grava ids; actions/news.ts converte). */
    themes?: string[]
    /** Categoria como nome normalizado ("festivais-e-eventos"), o value dos filtros. */
    category: string;
    imageUrl?: string;
}

// A lista de notícias vem da API (actions/news.ts): só chegam as publicadas.
// As categorias e os temas são geridos no painel (Configurações > Conteúdos):
// ver news/categories.ts.
