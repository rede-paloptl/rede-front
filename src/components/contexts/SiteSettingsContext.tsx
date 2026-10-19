"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchSiteSettings } from "@/lib/siteSettings";
import { defaultSiteSettings, type SiteSettings } from "@/types/SiteSettings";

const SiteSettingsContext = createContext<SiteSettings>(defaultSiteSettings);

/**
 * Começa com o que o servidor carregou e depois vai buscar a versão actual à
 * API: as páginas estáticas trazem a do deploy, e o que se mudou no painel
 * desde então só chega assim.
 */
export const SiteSettingsProvider = ({ initialSettings, children }: { initialSettings: SiteSettings; children: ReactNode }) => {
    const [settings, setSettings] = useState(initialSettings);

    useEffect(() => {
        fetchSiteSettings()
            .then(setSettings)
            .catch((error) => console.error("[site-settings] não foi possível carregar a personalização:", error));
    }, []);

    return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
