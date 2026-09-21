import { newsCategories } from "../news/data";

// A lista de oportunidades vem da API (actions/opportunities.ts): só chegam as visíveis no site.

export const opportunityCategories = newsCategories;

export type opportunityCategory = 'Emprego' | "Co-produção" | "Parceria" | "Financiamento" | "Festval" | "Encontro" | "Workshop" | "Formação"
