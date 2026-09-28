"use client";

import { useEffect, useState, type ReactNode } from "react";

import { fetchTaxonomyTerms, getTaxonomy, setTaxonomyTerms, type TaxonomyTerm } from "@/lib/taxonomy";

/**
 * Preenche o store das listas (lib/taxonomy) com os termos que o servidor já
 * carregou, antes de qualquer filho desenhar. Se o servidor não os conseguiu
 * obter, tenta no browser e volta a desenhar quando chegarem.
 */
export const TaxonomyProvider = ({ initialTerms, children }: { initialTerms: TaxonomyTerm[]; children: ReactNode }) => {
    // Durante o render (e não num efeito): os filhos lêem o store logo a seguir.
    if (initialTerms.length > 0 && getTaxonomy().terms.length === 0) {
        setTaxonomyTerms(initialTerms);
    }

    const [, setVersion] = useState(getTaxonomy().version);

    useEffect(() => {
        if (getTaxonomy().terms.length > 0) return;

        fetchTaxonomyTerms()
            .then((terms) => {
                setTaxonomyTerms(terms);
                setVersion(getTaxonomy().version);
            })
            .catch((error) => console.error("[taxonomy] não foi possível carregar as listas:", error));
    }, []);

    return <>{children}</>;
};
