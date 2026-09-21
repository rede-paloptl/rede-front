"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    AUTH_TOKEN,
    NEXT_AUTH_CALLBACK_URL,
    NEXT_AUTH_CSRF_TOKEN,
    NEXT_AUTH_MESSAGE,
    NEXT_AUTH_SESSION_TOKEN,
    REDE_DATA,
    SESSION_EXPIRED_MESSAGE,
} from "@/actions/constants";

import {
    getSomeCookie,
    getSomeDataLocalStorage,
    removeSomeCookie,
    removeSomeDataLocalStorage,
    setSomeCookie,
    setSomeDataToLocalStorage,
} from "@/actions";

import {
    GoogleLoginPayload,
    LoginUsingEmailAndPassResponseType,
    loginUsingEmailAndPassword,
    loginUsingGoogle,
    signup,
    SignupResponseType,
} from "@/actions/authentication";
import type { SignupPayload } from "@/actions/authentication";

import { eraseCookie } from "@/actions/cookie";


export interface AuthInterface {
    user: any;
    isAuthenticated: boolean;
    loading: boolean;

    sigNup: (user: SignupPayload) => Promise<SignupResponseType>;

    signInUsingEmailAndPassword: (
        email: string,
        password: string
    ) => Promise<LoginUsingEmailAndPassResponseType>;

    signInUsingGoogle: (
        payload: GoogleLoginPayload
    ) => Promise<LoginUsingEmailAndPassResponseType>;

    signOut: (path?: string) => Promise<void>;

    /** Sessao recusada pelo servidor: limpa tudo e devolve ao login. */
    expireSession: (message?: string) => void;

    updateLoggedUserData: (data: any) => void;

    cleanSession: () => void;

    updaInternalDataState: (data: any) => any;
}


export const AuthContext = createContext<AuthInterface>({
    user: null,
    isAuthenticated: false,
    loading: true,
    sigNup: async () => ({} as SignupResponseType),
    signInUsingEmailAndPassword: async () =>
        ({} as LoginUsingEmailAndPassResponseType),
    signInUsingGoogle: async () =>
        ({} as LoginUsingEmailAndPassResponseType),
    signOut: async () => { },
    expireSession: () => { },
    updateLoggedUserData: () => { },
    cleanSession: () => { },
    updaInternalDataState: () => { },
});


export const AuthProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    /**
     * Recupera a sessão existente quando o Provider monta.
     */
    useEffect(() => {
        try {
            const storedUser = getSomeDataLocalStorage(REDE_DATA);

            if (storedUser) {
                const parsedUser =
                    typeof storedUser === "string"
                        ? JSON.parse(storedUser)
                        : storedUser;

                setUser(parsedUser);
            }
        } catch (error) {
            console.error(
                "Erro ao recuperar sessão:",
                error
            );

            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);


    /**
     * Limpa completamente a sessão.
     */
    const cleanSession = useCallback(() => {
        setUser(null);

        removeSomeCookie(null, AUTH_TOKEN);
        eraseCookie(AUTH_TOKEN);

        removeSomeDataLocalStorage(AUTH_TOKEN);
        removeSomeDataLocalStorage(REDE_DATA);

        removeSomeCookie(null, NEXT_AUTH_CALLBACK_URL);
        eraseCookie(NEXT_AUTH_CALLBACK_URL);

        removeSomeCookie(null, NEXT_AUTH_CSRF_TOKEN);
        eraseCookie(NEXT_AUTH_CSRF_TOKEN);

        removeSomeCookie(null, NEXT_AUTH_SESSION_TOKEN);
        eraseCookie(NEXT_AUTH_SESSION_TOKEN);

        removeSomeDataLocalStorage(NEXT_AUTH_MESSAGE);
    }, []);


    /**
     * Signup.
     */
    const sigNup = async (sigNupData: SignupPayload): Promise<SignupResponseType> => {
        const response = await signup(sigNupData);
        return response;
    }


    /**
     * Login.
     */
    const signInUsingEmailAndPassword = async (email: string, password: string) => {
        const response = await loginUsingEmailAndPassword(email, password);

        if (response?.user && response?.token) {
            updaInternalDataState({ profileData: response.user, token: response.token });
        }

        return response;
    }


    /**
     * Login via Google.
     */
    const signInUsingGoogle = async (payload: GoogleLoginPayload) => {
        const response = await loginUsingGoogle(payload);

        if (response?.user && response?.token) {
            updaInternalDataState({ profileData: response.user, token: response.token });
        }

        return response;
    }


    /**
     * Atualiza somente os dados do usuário.
     */
    const updateLoggedUserData = useCallback(
        (data: any) => {
            setUser(data);

            setSomeDataToLocalStorage(
                REDE_DATA,
                JSON.stringify(data)
            );
        },
        []
    );


    /**
     * Recebe a resposta completa de autenticação.
     *
     * Exemplo:
     *
     * {
     *   token,
     *   profileData,
     *   message
     * }
     */
    const updaInternalDataState = useCallback(
        (data: any) => {
            if (!data) return;

            const profileData = data.profileData;
            const token = data.token;

            setUser(profileData);

            if (token) {
                setSomeCookie(
                    AUTH_TOKEN,
                    token
                );

                setSomeDataToLocalStorage(
                    AUTH_TOKEN,
                    token
                );
            }

            setSomeDataToLocalStorage(
                REDE_DATA,
                JSON.stringify(profileData)
            );

            return data.message;
        },
        []
    );


    /**
     * Verifica se existe token.
     */
    const token = useMemo(() => {
        return (
            getSomeCookie(null, AUTH_TOKEN) ||
            getSomeDataLocalStorage(AUTH_TOKEN) ||
            null
        );
    }, [user]);


    /**
     * Estado de autenticação.
     */
    const isAuthenticated = useMemo(() => {
        return Boolean(user && token);
    }, [user, token]);


    /**
     * A sessao deixou de ser aceite pelo servidor (token expirado, revogado
     * ou ausente). Nao ha nada a tentar de novo: limpamos os dados locais e
     * devolvemos o utilizador ao login, com o aviso do que aconteceu.
     */
    const expireSession = useCallback(
        (message?: string) => {
            cleanSession();

            if (typeof window !== "undefined") {
                try {
                    window.sessionStorage.setItem(
                        SESSION_EXPIRED_MESSAGE,
                        message || "A sua sessão expirou. Inicie sessão novamente."
                    );
                } catch {
                    // sessionStorage indisponivel: seguimos para o login na mesma.
                }
            }

            router.replace("/login");
        },
        [cleanSession, router]
    );


    /**
     * Logout.
     */
    const signOut = useCallback(
        async (path?: string) => {
            cleanSession();

            setLoading(false);

            router.push(
                path || "/"
            );
        },
        [cleanSession, router]
    );


    const value = useMemo<AuthInterface>(
        () => ({
            user,
            isAuthenticated,
            loading,

            sigNup,
            signInUsingEmailAndPassword,
            signInUsingGoogle,
            signOut,
            expireSession,

            updateLoggedUserData,

            cleanSession,
            updaInternalDataState,
        }),
        [
            user,
            isAuthenticated,
            loading,

            sigNup,
            signInUsingEmailAndPassword,
            signInUsingGoogle,
            signOut,
            expireSession,

            updateLoggedUserData,

            cleanSession,
            updaInternalDataState,
        ]
    );


    /**
     * Enquanto a sessão está sendo recuperada,
     * não renderiza a aplicação.
     */
    if (loading) {
        return null;
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};