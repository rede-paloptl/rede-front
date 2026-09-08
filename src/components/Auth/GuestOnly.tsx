"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

type GuestOnlyProps = {
    children: React.ReactNode;
    /** Para onde vai o utilizador que ja tem sessao iniciada. */
    redirectTo?: string;
};

/**
 * Paginas exclusivas de visitantes (login, registo).
 *
 * Quem ja tem sessao iniciada nao tem nada que fazer aqui: e reencaminhado
 * para o perfil. Enquanto o reencaminhamento acontece nao mostramos o
 * formulario, para nao aparecer um ecra de login por baixo da sessao activa.
 */
export const GuestOnly: React.FC<GuestOnlyProps> = ({
    children,
    redirectTo = "/profile",
}) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading || !isAuthenticated) return;

        router.replace(redirectTo);
    }, [isAuthenticated, loading, redirectTo, router]);

    if (isAuthenticated) return null;

    return <>{children}</>;
};
