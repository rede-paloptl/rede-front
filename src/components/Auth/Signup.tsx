"use client"

import { customBlur } from '@/app/fonts';
import type { SignupPayload } from '@/actions/authentication';
import { User } from '@/types/User';
import { Heading } from "../ui/heading"
import { Text } from '../ui/text';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Building2, ChevronRight, MailCheck, UserRound } from 'lucide-react';
import { Input } from '../ui/Input';
import { GoogleIcon } from '@/icons/GoogleIcon';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle } from '@/lib/googleAuth';
import { ResendConfirmation } from './ResendConfirmation';

const normalizeUsernameBase = (value: string) => {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24);
};

const generateUsername = (user: User) => {
    const emailName = user.email.split("@")[0] ?? "";
    const base = normalizeUsernameBase(user.name || emailName || "utilizador");
    const suffix = Math.random().toString(36).slice(2, 8);

    return `${base || "utilizador"}-${suffix}`;
};

export const Signup: React.FC = () => {
    const { sigNup } = useAuth();

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    // if (!isAuthenticated) {
    //     return <div>Não autenticado</div>;
    // }


    const [message, setMessage] = useState("");
    const [showMessaage, setShowMessaage] = useState(false);
    const [requireConfirmation, setRequireConfirmation] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Email da conta criada que aguarda confirmacao: troca o formulario pelo ecra "verifique o seu email"
    const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

    const [googleProfile, setGoogleProfile] = useState<{
        name: string;
        image: string;
        email: string;
    }>();

    const canAdvance = acceptedTerms;

    const [register, setRegister] = useState<User>({
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
            username: ""
        }
    });
    const handleGoogleSignup = async () => {
        setShowMessaage(false);
        setGoogleLoading(true);

        try {
            const { profile } = await signInWithGoogle();

            setGoogleProfile(profile);
            setRegister((lastState) => ({
                ...lastState,
                name: profile.name || lastState.name,
                email: profile.email || lastState.email,
                imageUrl: profile.image || lastState.imageUrl,
                loginType: "google",
            }));
        } catch (err) {
            setRequireConfirmation(false);
            setShowMessaage(true);
            setMessage(err instanceof Error ? err.message : "Não foi possível continuar com o Google.");

            setTimeout(() => {
                setShowMessaage(false);
                setMessage("");
            }, 3000);
        } finally {
            setGoogleLoading(false);
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canAdvance || isSubmitting) return;

        setShowMessaage(false);
        setIsSubmitting(true);
        try {
            const signupData: SignupPayload = {
                ...register,
                profileData: {
                    ...register.profileData,
                    username: register.profileData.username?.trim() || generateUsername(register),
                },
                confirmationBaseUrl: window.location.origin,
            };
            const responseData = await sigNup(signupData);
            if (responseData?.error) {
                setRequireConfirmation(false);
                setShowMessaage(true);
                setMessage(responseData?.message || "Ocorreu um erro ao criar a conta.");

                setTimeout(() => {
                    setShowMessaage(false);
                    setMessage("");
                }, 3000);
                return;
            }

            if (responseData?.data) {
                const { user, requiresEmailConfirmation } = responseData?.data;
                setRequireConfirmation(requiresEmailConfirmation);

                if (user.loginType === "google") {
                    setShowMessaage(true);
                    setMessage("Conta criada com sucesso através do Google.<br/> Pode agora iniciar sessão.");

                    setTimeout(() => {
                        setShowMessaage(false);
                        setMessage("");
                        window.location.assign("/login");
                    }, 3000);
                }

                if (user.loginType === "normal" && requiresEmailConfirmation) {
                    setPendingConfirmationEmail(user.email);
                }
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (pendingConfirmationEmail) {
        return (
            <div className="w-md max-w-[calc(100vw-32px)] bg-rede-surface p-6">
                <div className="w-full h-auto flex flex-col items-center gap-4 text-center">
                    <div className="h-14 w-14 rounded-full bg-rede-yellow/10 text-rede-yellow flex items-center justify-center">
                        <MailCheck width={24} height={24} />
                    </div>
                    <Heading className={`text-rede-white ${customBlur.className} text-[48px] leading-14`}>Verifique o seu email</Heading>
                    <Text className="text-[14px] leading-5 font-medium">
                        Enviámos um link de confirmação para <span className="text-rede-yellow font-bold break-all">{pendingConfirmationEmail}</span>.
                        Abra-o para definir a sua palavra-passe e ativar a conta.
                    </Text>
                    <Text className="text-[14px] leading-5 text-rede-white/70">
                        O link expira em 24 horas. Se não o encontrar, verifique a pasta de spam.
                    </Text>
                </div>

                <div className="w-full mt-8">
                    <ResendConfirmation email={pendingConfirmationEmail} startWithCooldown />
                </div>

                <div className='w-full flex justify-center mt-8 mb-2'>
                    <Text className='text-[14px] leading-5 font-bold text-center flex items-center gap-2.5'>
                        Já confirmou?
                        <Link href="/login" className='text-[14px] leading-5 font-bold text-rede-yellow'>
                            Fazer Login
                        </Link>
                    </Text>
                </div>
            </div>
        )
    }

    return (
        <div className="w-md max-w-[calc(100vw-32px)] bg-rede-surface p-6">

            <div className="w-full h-auto flex flex-col items-center gap-4">
                <Heading className={`text-rede-white ${customBlur.className} text-[48px] leading-14`}>Criar conta</Heading>
                <Text className="text-[14px] leading-5 font-medium">Crie sua conta na REDE PALOP+TL</Text>

                <div className='w-full grid grid-cols-2 gap-3 mt-2'>
                    <div className={`h-2 rounded-full bg-rede-yellow`} key={"fjfddckv"} />
                    <div className={`h-2 rounded-full 'bg-rede-white/20`} key={"fjfdsckv"} />
                </div>
                <Text className="text-[14px] leading-5 font-bold text-rede-yellow">
                    Passo 1 de 2: {register.profileData.accountType === 'individual' ? 'Perfil Individual' : 'Perfil Empresa'}
                </Text>
            </div>

            <form className='w-full h-auto mt-6' onSubmit={handleSubmit}>
                <div className='w-full flex flex-col gap-6'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <Button
                            type='button'
                            variant={register.profileData.accountType === 'individual' ? 'primary' : 'secondary'}
                            icon={<UserRound width={14} height={14} />}
                            className={register.profileData.accountType === 'individual' ? 'text-rede-surface' : ''}
                            containerClassName='w-full'
                            onClick={() => setRegister((lastState) => ({ ...lastState, profileData: { ...lastState.profileData, accountType: 'individual' } }))}
                        >
                            Individual
                        </Button>
                        <Button
                            type='button'
                            variant={register.profileData.accountType === 'company' ? 'primary' : 'secondary'}
                            icon={<Building2 width={14} height={14} />}
                            className={register.profileData.accountType === 'company' ? 'text-rede-surface' : ''}
                            containerClassName='w-full'
                            onClick={() => setRegister((lastState) => ({ ...lastState, profileData: { ...lastState.profileData, accountType: 'company' } }))}
                        >
                            Empresa
                        </Button>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[20px] leading-7' htmlFor='nameField'>Nome</label>
                        <Input variant={"secondary"} placeholder='Seu nome' className='w-full' id='nameField' value={register.name} onChange={(event) => setRegister((lastState) => ({ ...lastState, name: event.target.value }))} />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[20px] leading-7' htmlFor='emailField'>Email</label>
                        <Input variant={"secondary"} type='email' placeholder='seu@email.com' className='w-full' id='emailField' value={register.email} onChange={(event) => setRegister((lastState) => ({ ...lastState, email: event.target.value }))} />
                    </div>

                    {googleProfile && (
                        <div className='flex items-center gap-3 rounded-lg border border-rede-white/20 p-3'>
                            <div
                                className='h-10 w-10 rounded-full bg-cover bg-center bg-rede-white/10'
                                style={{ backgroundImage: googleProfile.image ? `url(${googleProfile.image})` : undefined }}
                            />
                            <div className='min-w-0'>
                                <Text className='text-[15px] leading-5.5 font-bold truncate'>{googleProfile.name}</Text>
                                <Text className='text-[14px] leading-5 text-rede-white/70 truncate'>{googleProfile.email}</Text>
                            </div>
                        </div>
                    )}

                    {(showMessaage && message.length > 0) &&
                        <Text className={`text-[14px] leading-5 ${requireConfirmation ? "text-rede-yellow" : "text-rede-red"} text-center`} dangerouslySetInnerHTML={{ __html: message }} />
                    }


                    <div className='flex items-start gap-3 rounded-lg border border-rede-white/20 p-3 transition-colors hover:border-rede-white/40'>
                        <input
                            id='acceptedTermsField'
                            type='checkbox'
                            checked={acceptedTerms}
                            onChange={(event) => setAcceptedTerms(event.target.checked)}
                            aria-describedby='termsAgreementText'
                            className='mt-1 h-4 w-4 shrink-0 cursor-pointer accent-rede-yellow-500'
                        />
                        <Text id='termsAgreementText' as='div' className='text-[14px] leading-5 font-medium'>
                            <label htmlFor='acceptedTermsField' className='cursor-pointer'>Aceito</label>&nbsp;
                            <Link href="/assets/termos-de-utilização.pdf" target='_blank' className='text-rede-yellow'>Termos de Uso</Link>
                            &nbsp;e&nbsp;
                            <Link href="/assets/política-de-privacidade.pdf" target='_blank' className='text-rede-yellow'>Política de Privacidade</Link>
                        </Text>
                    </div>

                    <Button type='submit' containerClassName='w-full' className='text-rede-surface' icon={<ChevronRight width={14} height={14} />} iconPosition='right' disabled={!canAdvance || isSubmitting}>
                        {isSubmitting ? "A criar conta..." : "Avançar"}
                    </Button>

                    <Button type='button' variant={"secondary"} icon={<GoogleIcon width={12} height={12} />} className='w-full' containerClassName='w-full' disabled={googleLoading || !canAdvance} onClick={handleGoogleSignup}>
                        {googleLoading ? "A ligar ao Google..." : "Continue com Google"}
                    </Button>
                </div>
                <div className='w-full flex justify-center mt-8 mb-2'>
                    <Text className='text-[14px] leading-5 font-bold text-center flex items-center gap-2.5'>
                        Já tem uma conta?
                        <Link href="/login" className='text-[14px] leading-5 font-bold text-rede-yellow'>
                            Fazer Login
                        </Link>
                    </Text>
                </div>
            </form>
        </div>
    )
}
