"use client"

import { getLoggedUser, updateLoggedUser, type GetLoggedUserResponseType } from "@/actions/users";
import Footer from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { Achievements } from "@/components/profile/Achievements";
import { Bio } from "@/components/profile/Bio";
import { Filmography } from "@/components/profile/Filmography";
import { Hero } from "@/components/profile/Hero";
import { OutsideAgency } from "@/components/profile/OutsideAgency";
import { AssociatedNews } from "@/components/profile/AssociatedNews";
import { useAuth } from "@/hooks/useAuth";
import { ProfileFilm, User } from "@/types/User";
import { useCallback, useEffect, useRef, useState } from "react";

type ProfileData = User["profileData"];

const defaultProfileData: ProfileData = {
    accountType: "individual",
    country: "",
    city: "",
    professionalPhone: "",
    professionalEmail: "",
    birthDate: "",
    artisticName: "",
    commercialName: "",
    creationDate: "",
    isRegistered: false,
    services: [],
    otherService: "",
    coverImageUrl: "",
    imageUrl: "",
    // Sem valor gravado, o perfil conta como visivel (ver isProfileVisible).
    isVisible: true,
};

const isBrowserBlobUrl = (value?: string | null) => Boolean(value?.startsWith("blob:"));

const hydrateProfileData = (profile?: User | null): ProfileData => ({
    ...defaultProfileData,
    ...profile?.profileData,
});

/**
 * Uma capa "blob:" e apenas a pre-visualizacao local de um ficheiro que ainda
 * nao foi carregado. Nunca pode ser gravada — e, sobretudo, nunca pode fazer
 * desaparecer o filme. Mantemos o filme e a capa que ja estava guardada.
 */
const preserveSavedCover = (film: ProfileFilm, savedFilms?: ProfileFilm[]): ProfileFilm => {
    if (!isBrowserBlobUrl(film.cover)) return film;

    const savedFilm = savedFilms?.find((item) => item.id === film.id);

    return { ...film, cover: savedFilm?.cover ?? "" };
};

/**
 * Prepara o patch para envio. Só as chaves presentes seguem para a API: o que
 * for omitido mantem no servidor o valor que la esta gravado.
 */
const sanitizeProfileDataForSave = (
    patch: Partial<ProfileData>,
    savedProfileData: ProfileData,
): Partial<ProfileData> => {
    const sanitized: Partial<ProfileData> = { ...patch };

    if (isBrowserBlobUrl(sanitized.coverImageUrl)) delete sanitized.coverImageUrl;
    if (isBrowserBlobUrl(sanitized.imageUrl)) delete sanitized.imageUrl;

    if (sanitized.filmography) {
        sanitized.filmography = sanitized.filmography.map(
            (film) => preserveSavedCover(film, savedProfileData.filmography),
        );
    }

    if (sanitized.outsideAgency) {
        sanitized.outsideAgency = sanitized.outsideAgency.map(
            (film) => preserveSavedCover(film, savedProfileData.outsideAgency),
        );
    }

    return sanitized;
};

type ProfileContentProps = {
    isAuthenticated: boolean;
    profile: User | null;
    updateLoggedUserData: (data: User) => void;
    expireSession: (message?: string) => void;
};

const ProfileContent: React.FC<ProfileContentProps> = ({
    isAuthenticated,
    profile,
    updateLoggedUserData,
    expireSession,
}) => {
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>(() => hydrateProfileData(profile));

    /**
     * Estado da sincronizacao com o servidor.
     *
     * O perfil so pode ser gravado depois de termos a copia real da API. Gravar
     * a partir do snapshot do localStorage era o que apagava dados guardados
     * noutro dispositivo, noutro separador ou noutra sessao.
     */
    const [syncStatus, setSyncStatus] = useState<"loading" | "ready" | "error">("loading");

    // Ultima versao confirmada pelo servidor.
    const savedProfileDataRef = useRef<ProfileData>(profileData);

    const applyServerProfile = useCallback(
        (response: GetLoggedUserResponseType) => {
            // O servidor rejeitou o token: nao adianta oferecer "tentar novamente".
            if (response.unauthorized) {
                expireSession(response.message);
                return;
            }

            if (!response.data?.user) {
                setSyncStatus("error");
                setMessage(response.message || "Não foi possível carregar o perfil.");
                return;
            }

            const serverProfileData = hydrateProfileData(response.data.user);

            savedProfileDataRef.current = serverProfileData;
            setProfileData(serverProfileData);
            updateLoggedUserData({
                ...response.data.user,
                profileData: serverProfileData,
            });
            setMessage("");
            setSyncStatus("ready");
        },
        [updateLoggedUserData, expireSession],
    );

    useEffect(() => {
        if (!isAuthenticated) return;

        let isCurrent = true;

        void getLoggedUser().then((response) => {
            if (!isCurrent) return;

            applyServerProfile(response);
        });

        return () => {
            isCurrent = false;
        };
    }, [isAuthenticated, applyServerProfile]);

    const retrySync = () => {
        setSyncStatus("loading");

        void getLoggedUser().then(applyServerProfile);
    };

    const saveProfileData = async (patch: Partial<ProfileData>, userPatch: Partial<Pick<User, "name">> = {}) => {
        if (syncStatus !== "ready") {
            setMessage(
                syncStatus === "loading"
                    ? "A carregar o perfil. Tente novamente dentro de instantes."
                    : "Sem ligação ao perfil guardado. Recarregue a página antes de gravar.",
            );

            return false;
        }

        setMessage("");
        setIsSaving(true);

        // Enviamos apenas a seccao editada; o servidor funde com o resto do perfil.
        const profileDataPatch = sanitizeProfileDataForSave(patch, savedProfileDataRef.current);

        const response = await updateLoggedUser({
            ...userPatch,
            ...(Object.keys(profileDataPatch).length > 0
                ? { profileData: profileDataPatch }
                : {}),
        });

        setIsSaving(false);

        if (response.unauthorized) {
            expireSession(response.message);
            return false;
        }

        if (response.error) {
            setMessage(response.message || "Não foi possível atualizar o perfil.");
            return false;
        }

        const updatedUser = response.data?.user;

        // A resposta traz o utilizador ja fundido pelo servidor: e essa a versao correcta.
        const nextProfileData = updatedUser
            ? hydrateProfileData(updatedUser)
            : { ...profileData, ...patch };

        savedProfileDataRef.current = nextProfileData;
        setProfileData(nextProfileData);

        if (updatedUser) {
            updateLoggedUserData({
                ...updatedUser,
                ...userPatch,
                profileData: nextProfileData,
            });
        }

        return true;
    };

    return (
        <>
            {message && (
                <div className="fixed right-6 top-20 z-20 max-w-sm rounded-lg border border-rede-red bg-rede-surface px-4 py-3 text-sm text-rede-red">
                    <p>{message}</p>
                    {syncStatus === "error" && (
                        <button
                            type="button"
                            onClick={retrySync}
                            className="mt-2 underline underline-offset-2"
                        >
                            Tentar novamente
                        </button>
                    )}
                </div>
            )}
            <Hero
                isAuthenticated={isAuthenticated}
                profile={profile ?? undefined}
                profileData={profileData}
                isSaving={isSaving}
                onSaveProfileData={saveProfileData}
                onImageUploadError={setMessage}
            />
            <Bio
                isAuthenticated={isAuthenticated}
                profile={profile ?? undefined}
                profileData={profileData}
                isSaving={isSaving}
                onSaveProfileData={saveProfileData}
            />
            <Achievements
                isAuthenticated={isAuthenticated}
                achievements={profileData.achievements}
                films={[...(profileData.filmography ?? []), ...(profileData.outsideAgency ?? [])]}
                isSaving={isSaving}
                onSaveAchievements={(achievements) => saveProfileData({ achievements })}
            />
            <Filmography
                isAuthenticated={isAuthenticated}
                films={profileData.filmography}
                achievements={profileData.achievements}
                accountType={profileData.accountType}
                isSaving={isSaving}
                onSaveFilms={(filmography) => saveProfileData({ filmography })}
            />
            {/* <OutsideAgency
                isAuthenticated={isAuthenticated}
                films={profileData.outsideAgency}
                achievements={profileData.achievements}
                accountType={profileData.accountType}
                isSaving={isSaving}
                onSaveFilms={(outsideAgency) => saveProfileData({ outsideAgency })}
            /> */}
        </>
    );
};

export default function ProfilePage() {
    const { user, isAuthenticated, updateLoggedUserData, expireSession } = useAuth();
    const profile = user as User | null;
    const profileKey = profile?.email ?? "guest";

    return (
        <main className="bg-rede-surface">
            <TopBar />
            <ProfileContent
                key={profileKey}
                isAuthenticated={isAuthenticated}
                profile={profile}
                updateLoggedUserData={updateLoggedUserData}
                expireSession={expireSession}
            />
            <AssociatedNews />
            <Footer />
        </main>
    )
}