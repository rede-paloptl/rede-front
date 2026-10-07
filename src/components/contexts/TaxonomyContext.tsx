"use client";

import { useEffect, useState, type ReactNode } from "react";

import { fetchTaxonomyTerms, getTaxonomy, setTaxonomyTerms, type TaxonomyTerm } from "@/lib/taxonomy";

/**
 * Preenche o store das listas (lib/taxonomy) com os termos que o servidor já
 * carregou, antes de qualquer filho desenhar. Depois vai sempre buscar a
 * lista actual à API e volta a desenhar: as páginas estáticas trazem a lista
 * do dia do deploy, e o que se mudou no painel desde então só chega assim.
 */
export const TaxonomyProvider = ({ initialTerms, children }: { initialTerms: TaxonomyTerm[]; children: ReactNode }) => {
    // Durante o render (e não num efeito): os filhos lêem o store logo a seguir.
    if (initialTerms.length > 0 && getTaxonomy().terms.length === 0) {
        setTaxonomyTerms(initialTerms);
    }

    const [, setVersion] = useState(getTaxonomy().version);

    useEffect(() => {
        fetchTaxonomyTerms()
            .then((terms) => {
                setTaxonomyTerms(terms);
                setVersion(getTaxonomy().version);
            })
            .catch((error) => console.error("[taxonomy] não foi possível carregar as listas:", error));
    }, []);

    return <>{children}</>;
};
