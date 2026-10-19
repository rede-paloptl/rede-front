"use client";

import { AuthProvider } from "@/components/contexts/AuthContext";
import { SiteSettingsProvider } from "@/components/contexts/SiteSettingsContext";
import { TaxonomyProvider } from "@/components/contexts/TaxonomyContext";
import type { TaxonomyTerm } from "@/lib/taxonomy";
import type { SiteSettings } from "@/types/SiteSettings";
import type { ReactNode } from "react";

interface ProvidersProps {
    children: ReactNode;
    taxonomyTerms: TaxonomyTerm[];
    siteSettings: SiteSettings;
}

export default function Providers({ children, taxonomyTerms, siteSettings }: ProvidersProps) {
    return (
        <TaxonomyProvider initialTerms={taxonomyTerms}>
            <SiteSettingsProvider initialSettings={siteSettings}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </SiteSettingsProvider>
        </TaxonomyProvider>
    );
}
