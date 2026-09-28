"use client";

import { AuthProvider } from "@/components/contexts/AuthContext";
import { TaxonomyProvider } from "@/components/contexts/TaxonomyContext";
import type { TaxonomyTerm } from "@/lib/taxonomy";
import type { ReactNode } from "react";

interface ProvidersProps {
    children: ReactNode;
    taxonomyTerms: TaxonomyTerm[];
}

export default function Providers({ children, taxonomyTerms }: ProvidersProps) {
    return (
        <TaxonomyProvider initialTerms={taxonomyTerms}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </TaxonomyProvider>
    );
}
