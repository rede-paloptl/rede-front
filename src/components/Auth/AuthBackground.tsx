"use client";

import type { ReactNode } from "react";

import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";
import { cn } from "@/lib/utils";

type AuthBackgroundProps = {
    /** "signup" serve o registo, o onboarding, confirmar conta e recuperar a palavra-passe. */
    variant: "login" | "signup";
    className?: string;
    children: ReactNode;
};

/** Fundo das páginas de conta, gerido no painel (Personalizar > Login e registo). */
export const AuthBackground = ({ variant, className, children }: AuthBackgroundProps) => {
    const { auth } = useSiteSettings();
    const imageUrl = variant === "login" ? auth.loginImageUrl : auth.signupImageUrl;

    return (
        <div className={cn("bg-cover bg-center", className)} style={{ backgroundImage: `url("${imageUrl}")` }}>
            {children}
        </div>
    );
};
