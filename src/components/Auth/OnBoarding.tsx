"use client"
import { Button } from "../ui/button";
import { Input } from "../ui/Input";
import { Text } from "../ui/text";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Select } from "../ui/select";
import { countries, services, socialFields } from "./data";
import { SelectMultiple } from "../ui/select-multiple";
import { SocialNetwork } from "@/types/Profile";
import { User } from "@/types/User";
import { customBlur } from "@/app/fonts";
import { Heading } from "../ui/heading";
import { useAuth } from "@/hooks/useAuth";
import { updateLoggedUser } from "@/actions/users";
import { useRouter } from "next/navigation";

type ProfileData = User["profileData"];
type OnboardingUser = Partial<Omit<User, "profileData">> & { profileData?: Partial<ProfileData> | null };
// Valores tal como a API os guarda (sem acentos). O que o utilizador ve e a
// label de data.ts ("Moçambique"); isto e so o valor transmitido.
type ApiCountry =
    | "Angola"
    | "Cabo Verde"
    | "Guine-Bissau"
    | "Mocambique"
    | "Sao Tome e Principe"
    | "Timor-Leste";
type MiniStepKey = "identity" | "contact" | "association" | "services" | "social";
type MiniStep = {
    key: MiniStepKey;
    title: string;
    description: string;
};
const fieldGroupClassName = "flex flex-col gap-2";
const labelClassName = "text-[16px] leading-6 font-medium";
const defaultRegister: User = {
    name: "",
    email: "",
    loginType: "normal",
    userType: "normal",
    profileData: {
        accountType: 'individual',
        artisticName: "",
        birthDate: "",
        city: "",
        commercialName: "",
        country: "",
        creationDate: "",
        isRegistered: false,
        otherService: "",
        professionalEmail: "",
        professionalPhone: "",
        services: [],
        coverImageUrl: "",
        imageUrl: "",
        // Quem se regista entra visivel na Rede; pode esconder-se depois.
        isVisible: true
    }
};
const formatDateField = (value?: string | Date) => {
    if (!value) return "";

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    return String(value).slice(0, 10);
};
const apiCountryByFormValue: Record<string, ApiCountry> = {
    angola: "Angola",
    "cabo-verde": "Cabo Verde",
    "guine-bissau": "Guine-Bissau",
    mocambique: "Mocambique",
    "sao-tome-principe": "Sao Tome e Principe",
    "timor-leste": "Timor-Leste",
};
const formCountryByApiValue = Object.entries(apiCountryByFormValue).reduce<Record<string, string>>(
    (countriesByApiValue, [formValue, apiValue]) => ({
        ...countriesByApiValue,
        [apiValue]: formValue,
    }),
    {}
);
const isValidUrl = (value: string) => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};
const sanitizeProfileData = (profileData: ProfileData): ProfileData => {
    const socialLinks = Object.entries(profileData.socialLinks ?? {}).reduce<NonNullable<ProfileData["socialLinks"]>>(
        (links, [key, value]) => {
            const trimmedValue = String(value ?? "").trim();

            if (trimmedValue && isValidUrl(trimmedValue)) {
                links[key as SocialNetwork] = trimmedValue;
            }

            return links;
        },
        {}
    );

    return {
        ...profileData,
        country: apiCountryByFormValue[profileData.country] ?? profileData.country,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
    };
};
const buildRegisterFromUser = (user?: OnboardingUser | null): User => {
    if (!user) return defaultRegister;

    const userProfileData = user.profileData ?? {};
    const country = userProfileData.country ? (formCountryByApiValue[userProfileData.country] ?? userProfileData.country) : "";
    const hydratedProfileData: ProfileData = {
        ...defaultRegister.profileData,
        ...userProfileData,
        country,
        birthDate: formatDateField(userProfileData.birthDate),
        creationDate: formatDateField(userProfileData.creationDate),
        services: Array.isArray(userProfileData.services) ? userProfileData.services : [],
    };

    return {
        ...defaultRegister,
        ...user,
        name: user.name ?? "",
        email: user.email ?? "",
        loginType: user.loginType ?? "normal",
        userType: user.userType ?? "normal",
        imageUrl: user.imageUrl,
        profileData: hydratedProfileData,
    };
};
const getMiniSteps = (
    accountType: ProfileData["accountType"],
): MiniStep[] => {
    const commonSteps: MiniStep[] = [
        {
            key: "identity",
            title:
                accountType === "individual"
                    ? "Dados artísticos"
                    : "Dados da entidade",
            description: "Comece pelos dados essenciais do perfil.",
        },
        {
            key: "contact",
            title: "Localização e contacto",
            description: "Indique onde está e como pode ser contactado.",
        },
    ];

    const accountStep: MiniStep =
        accountType === "individual"
            ? {
                  key: "association",
                  title: "Associação",
                  description:
                      "Pode indicar uma empresa ou um colectivo associado.",
              }
            : {
                  key: "services",
                  title: "Serviços",
                  description:
                      "Indique os serviços disponibilizados pela entidade.",
              };

    return [
        ...commonSteps,
        accountStep,
        {
            key: "social",
            title: "Redes sociais",
            description: "Adicione apenas as ligações que pretende apresentar.",
        },
    ];
};
export const OnBoarding: React.FC = () => {
    const router = useRouter();
    const { user, updateLoggedUserData, expireSession } = useAuth();
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [register, setRegister] = useState<User>(() => buildRegisterFromUser(user));
    const [selectedServices, setSelectedServices] = useState<string[]>(() => register.profileData.services);
    const [miniStepIndex, setMiniStepIndex] = useState(0);
    const miniSteps = useMemo(() => getMiniSteps(register.profileData.accountType), [register.profileData.accountType]);
    const activeMiniStep = miniSteps[miniStepIndex] ?? miniSteps[0];
    const isFirstMiniStep = miniStepIndex === 0;
    const isLastMiniStep = miniStepIndex === miniSteps.length - 1;


    const updateProfileData = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
        setRegister((lastState) => ({
            ...lastState,
            profileData: {
                ...lastState.profileData,
                [key]: value,
            },
        }));
    };
    const updateCountry = (value: string) => {
        setRegister((lastState) => ({
            ...lastState,
            profileData: {
                ...lastState.profileData,
                country: value,
                city: ''
            }
        }));
    };
    const countryOptions = useMemo(() => countries.filter((country) => country.value in apiCountryByFormValue), []);
    const cityOptions = useMemo(() => {
        return countries.find((item) => item.value === register.profileData.country)?.cities.map((item) => ({
            label: item,
            value: item,
        })) ?? [];
    }, [register.profileData.country]);
    const goToNextMiniStep = () => {
        setMiniStepIndex((currentStep) => Math.min(currentStep + 1, miniSteps.length - 1));
    };
    const goToPreviousMiniStep = () => {
        setMiniStepIndex((currentStep) => Math.max(currentStep - 1, 0));
    };
    const updateSocialLink = (key: SocialNetwork, value: string) => {
        setRegister((lastState) => {
            const currentSocialLinks = lastState.profileData.socialLinks;
            return {
                ...lastState,
                profileData: {
                    ...lastState.profileData,
                    socialLinks: {
                        ...currentSocialLinks,
                        [key]: value,
                    }
                }
            };
        });
    }
    const handleServicesChange = (value: string[]) => {
        setSelectedServices(value);
        updateProfileData("services", value);
    };
    const saveOnboarding = async () => {
        setMessage("");

        if (!apiCountryByFormValue[register.profileData.country]) {
            setMessage("Selecione um pais valido.");
            setMiniStepIndex(1);
            return;
        }

        if (register.profileData.accountType === "individual" && !register.profileData.artisticName.trim()) {
            setMessage("Informe o nome artistico.");
            setMiniStepIndex(0);
            return;
        }

        if (register.profileData.accountType === "individual" && !register.profileData.birthDate) {
            setMessage("Informe a data de nascimento.");
            setMiniStepIndex(0);
            return;
        }

        const profileData = sanitizeProfileData(register.profileData);

        setLoading(true);

        const response = await updateLoggedUser({
            profileData,
        });

        if (response.unauthorized) {
            expireSession(response.message);
            return;
        }

        if (response.error) {
            setMessage(response.message || "Nao foi possivel atualizar os dados.");
            setLoading(false);
            return;
        }

        if (response.data?.user) {
            updateLoggedUserData(response.data.user);
            router.push("/profile");
            return;
        }

        setMessage(response.message || "Nao foi possivel atualizar os dados.");
        setLoading(false);
    }
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isLastMiniStep || isLoading) return;

        void saveOnboarding();
    }
    const renderSocialFields = () => (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {socialFields.map((field) => (
                <div className={fieldGroupClassName} key={field.key}>
                    <label className={labelClassName} htmlFor={`${field.key}Field`}>{field.label}</label>
                    <Input
                        variant={"secondary"}
                        placeholder={field.placeholder}
                        className='w-full'
                        id={`${field.key}Field`}
                        value={register.profileData.socialLinks?.[field.key] ?? ''}
                        onChange={(event) => updateSocialLink(field.key, event.target.value)}
                    />
                </div>
            ))}
        </div>
    );
    const renderIdentityStep = () => {
        if (register.profileData.accountType === 'individual') {
            return (
                <div className='grid grid-cols-1 gap-4'>
                    <div className={fieldGroupClassName}>
                        <label className={labelClassName} htmlFor='nameField'>Nome</label>
                        <Input variant={"secondary"} placeholder='Seu nome' id='nameField' value={register.name} onChange={(event) => setRegister((lastState) => ({ ...lastState, name: event.target.value }))} />
                    </div>
                    <div className={fieldGroupClassName}>
                        <label className={labelClassName} htmlFor='artisticNameField'>Nome Artistico</label>
                        <Input variant={"secondary"} placeholder='Nome artistico' id='artisticNameField' value={register.profileData.artisticName} onChange={(event) => updateProfileData("artisticName", event.target.value)} />
                    </div>
                    <div className={fieldGroupClassName}>
                        <label className={labelClassName} htmlFor='birthDateField'>Data de Nascimento</label>
                        <Input variant={"secondary"} type='date' id='birthDateField' value={register.profileData.birthDate} onChange={(event) => updateProfileData("birthDate", event.target.value)} />
                    </div>
                </div>
            );
        }
        return (
            <div className='grid grid-cols-1 gap-4'>
                <div className={fieldGroupClassName}>
                    <label className={labelClassName} htmlFor='nameField'>Nome</label>
                    <Input variant={"secondary"} placeholder='Nome da conta' id='nameField' value={register.name} onChange={(event) => setRegister((lastState) => ({ ...lastState, name: event.target.value }))} />
                </div>
                <div className={fieldGroupClassName}>
                    <label className={labelClassName} htmlFor='commercialNameField'>Nome comercial</label>
                    <Input variant={"secondary"} placeholder='Nome comercial' id='commercialNameField' value={register.profileData.commercialName} onChange={(event) => updateProfileData("commercialName", event.target.value)} />
                </div>
                <div className={fieldGroupClassName}>
                    <label className={labelClassName} htmlFor='creationDateField'>Data de Criação</label>
                    <Input variant={"secondary"} type='date' id='creationDateField' value={register.profileData.creationDate} onChange={(event) => updateProfileData("creationDate", event.target.value)} />
                </div>
                <div className={fieldGroupClassName}>
                    <label className={labelClassName}>A entidade esta registada?</label>
                    <Select variant={"secondary"} options={[{ label: 'Sim', value: 'yes' }, { label: 'Não', value: 'no' }]} value={register.profileData.isRegistered ? "yes" : "no"} onChange={(value) => updateProfileData("isRegistered", value === "yes")} />
                </div>
            </div>
        );
    };
    const renderContactStep = () => (
        <div className='grid grid-cols-1 gap-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className={fieldGroupClassName}>
                    <label className={labelClassName}>Pais</label>
                    <Select variant={"secondary"} options={countryOptions.map(({ label, value }) => ({ label, value }))} value={register.profileData.country} onChange={updateCountry} placeholder='Selecione o pais' />
                </div>
                <div className={fieldGroupClassName}>
                    <label className={labelClassName}>Cidade</label>
                    <Select variant={"secondary"} options={cityOptions} value={register.profileData.city} onChange={(value) => updateProfileData("city", value)} placeholder={register.profileData.country ? 'Selecione a cidade' : 'Selecione o pais primeiro'} disabled={!register.profileData.country} />
                </div>
            </div>
            <div className={fieldGroupClassName}>
                <label className={labelClassName} htmlFor='professionalEmailField'>Email Profissional</label>
                <Input variant={"secondary"} type='email' placeholder='profissional@email.com' id='professionalEmailField' value={register.profileData.professionalEmail} onChange={(event) => updateProfileData("professionalEmail", event.target.value)} />
            </div>
            <div className={fieldGroupClassName}>
                <label className={labelClassName} htmlFor='professionalPhoneField'>Telefone profissional / WhatsApp</label>
                <Input variant={"secondary"} type='tel' placeholder='+670 0000 0000' id='professionalPhoneField' value={register.profileData.professionalPhone} onChange={(event) => updateProfileData("professionalPhone", event.target.value)} />
            </div>
        </div>
    );
    const renderAssociationStep = () => (
        <div className={fieldGroupClassName}>
            <label className={labelClassName}>Esta associado a alguma empresa ou colectivo?</label>
            <Select variant={"secondary"} options={[{ label: 'Nao', value: 'no' }, { label: 'Sim', value: 'yes' }]} value={register.profileData.associatedWithCompany?.status ? "yes" : "no"} onChange={(value) => {
                setRegister((lastState) => {
                    return (value === "yes")
                        ? { ...lastState, profileData: { ...lastState.profileData, associatedWithCompany: { status: true, companyName: "" } } }
                        : { ...lastState, profileData: { ...lastState.profileData, associatedWithCompany: undefined } };
                })
            }} />
            {register.profileData.associatedWithCompany && (
                <Input variant={"secondary"} placeholder='Nome da empresa ou colectivo' value={register.profileData.associatedWithCompany?.companyName} onChange={(event) => {
                    updateProfileData("associatedWithCompany", { status: true, companyName: event.target.value });
                }} />
            )}
        </div>
    );
    const renderServicesStep = () => (
        <div className='grid grid-cols-1 gap-4'>
            <div className={fieldGroupClassName}>
                <label className={labelClassName}>Servicos fornecidos</label>
                <SelectMultiple variant={"secondary"} options={services} value={selectedServices} onChange={handleServicesChange} placeholder='Selecione todos os servicos' />
            </div>
            <div className={fieldGroupClassName}>
                <label className={labelClassName} htmlFor='otherServiceField'>Acrescentar servico nao descrito</label>
                <Input variant={"secondary"} placeholder='Outro servico' id='otherServiceField' value={register.profileData.otherService} onChange={(event) => updateProfileData("otherService", event.target.value)} />
            </div>
            <div className={fieldGroupClassName}>
                <label className={labelClassName}>A empresa/organizacao fornece aluguer de equipamentos?</label>
                <Select variant={"secondary"} options={[{ label: 'Nao', value: 'no' }, { label: 'Sim', value: 'yes' }]} value={register.profileData.rentsEquipment?.status ? "yes" : "none"} onChange={(value) => {
                    setRegister((lastState) => {
                        return (value === "yes")
                            ? { ...lastState, profileData: { ...lastState.profileData, rentsEquipment: { status: true, equipmentName: "" } } }
                            : { ...lastState, profileData: { ...lastState.profileData, rentsEquipment: undefined } };
                    })
                }} />
                {register.profileData.rentsEquipment && (
                    <textarea
                        className='min-h-28 w-full rounded-2xl border-[1.3px] border-white bg-rede-surface px-6 py-4 text-[14px] font-medium text-rede-white outline-none placeholder:text-rede-white/40'
                        placeholder='Indique quais equipamentos estao disponiveis para aluguer'
                        value={register.profileData.rentsEquipment?.equipmentName}
                        onChange={(event) => updateProfileData("rentsEquipment", { status: true, equipmentName: event.target.value })}
                    />
                )}
            </div>
        </div>
    );
    const renderMiniStepContent = () => {
        switch (activeMiniStep.key) {
            case "identity":
                return renderIdentityStep();
            case "contact":
                return renderContactStep();
            case "association":
                return renderAssociationStep();
            case "services":
                return renderServicesStep();
            case "social":
                return (
                    <div className='flex flex-col gap-3'>
                        {renderSocialFields()}
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="w-md max-w-[calc(100vw-32px)] bg-rede-surface p-6">
            <div className="w-full h-auto flex flex-col items-center gap-4">
                <Heading className={`text-rede-white ${customBlur.className} text-[48px] leading-14`}>Preencher Perfil</Heading>
                <Text className="text-[14px] leading-5 font-medium">Crie sua conta na REDE PALOP+TL</Text>
                <div className='w-full grid grid-cols-2 gap-3 mt-2'>
                    <div className={`h-2 rounded-full 'bg-rede-white/20`} key={"fjfdsckv"} />
                    <div className={`h-2 rounded-full bg-rede-yellow`} key={"fjfddckv"} />
                </div>
                <Text className="text-[14px] leading-5 font-bold text-rede-yellow">
                    Passo 2 de 2: {register.profileData.accountType === 'individual' ? 'Perfil Individual' : 'Perfil Empresa'}
                </Text>
            </div>
            <form className='w-full h-auto mt-6' onSubmit={handleSubmit}>
                <div className='w-full flex flex-col gap-5'>
                    <div className='flex flex-col gap-3'>
                        <div className='flex items-start justify-between gap-4'>
                            <div className='min-w-0'>
                                <Text className='text-[18px] leading-6 font-bold text-rede-white'>{activeMiniStep.title}</Text>
                                <Text className='mt-1 text-[13px] leading-5 text-rede-white/60'>{activeMiniStep.description}</Text>
                            </div>
                            <Text className='shrink-0 text-[12px] leading-4 font-bold text-rede-yellow'>
                                {miniStepIndex + 1}/{miniSteps.length}
                            </Text>
                        </div>
                        <div className='grid grid-cols-4 gap-2'>
                            {miniSteps.map((step, index) => (
                                <button
                                    type='button'
                                    key={step.key}
                                    aria-label={`Ir para ${step.title}`}
                                    onClick={() => setMiniStepIndex(index)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index <= miniStepIndex ? 'bg-rede-yellow' : 'bg-rede-white/15'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div key={activeMiniStep.key} className='min-h-[230px] motion-safe:animate-[onboardingMiniStep_180ms_ease-out]'>
                        {renderMiniStepContent()}
                    </div>
                    {message.length > 0 && (
                        <Text className='text-[14px] leading-5 text-rede-red text-center'>
                            {message}
                        </Text>
                    )}
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                        <Button type='button' variant={"secondary"} containerClassName='w-full' onClick={goToPreviousMiniStep} disabled={isFirstMiniStep || isLoading}>
                            Voltar
                        </Button>
                        {!isLastMiniStep && (
                            <Button type='button' variant={"secondary"} containerClassName='w-full' onClick={goToNextMiniStep} disabled={isLoading}>
                                Pular
                            </Button>
                        )}
                        {isLastMiniStep ? (
                            <Button type='button' containerClassName='w-full sm:col-span-2' className='text-rede-surface' disabled={isLoading} onClick={saveOnboarding}>
                                {isLoading ? 'A processar...' : 'Terminar'}
                            </Button>
                        ) : (
                            <Button type='button' containerClassName='w-full' className='text-rede-surface' onClick={goToNextMiniStep} disabled={isLoading}>
                                Continuar
                            </Button>
                        )}
                    </div>
                </div>
                <div className='w-full flex justify-center mt-8 mb-2'>
                    <Text className='text-[14px] leading-5 font-bold text-center flex items-center gap-2.5'>
                        Ja tem uma conta?
                        <Link href="/login" className='text-[14px] leading-5 font-bold text-rede-yellow'>
                            Fazer Login
                        </Link>
                    </Text>
                </div>
            </form>
            <style jsx>{`
                @keyframes onboardingMiniStep {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}