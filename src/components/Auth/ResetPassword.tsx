"use client"

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateEmail } from "@/actions";
import { requestPasswordReset, resetPassword } from "@/actions/authentication";
import { Button } from "../ui/button";
import { Input } from "../ui/Input";
import { Text } from "../ui/text";
import { NewPasswordFields, validateNewPassword } from "./NewPasswordFields";
import { TURNSTILE_SITE_KEY, TurnstileHandle, TurnstileWidget } from "./TurnstileWidget";

// Igual ao intervalo minimo entre pedidos no back-end.
const COOLDOWN_SECONDS = 60;

type Feedback = { ok: boolean; message: string };

const FeedbackText: React.FC<{ feedback: Feedback | null }> = ({ feedback }) =>
    feedback ? (
        <Text role={feedback.ok ? "status" : "alert"} className={`text-[14px] leading-5 text-center ${feedback.ok ? "text-rede-yellow" : "text-rede-red"}`}>
            {feedback.message}
        </Text>
    ) : null;

const BackToLogin: React.FC = () => (
    <div className='w-full flex justify-center mt-8 mb-2'>
        <Text className='text-[14px] leading-5 font-bold text-center flex items-center gap-2.5'>
            Lembrou-se da palavra-passe?
            <Link href="/login" className='text-[14px] leading-5 font-bold text-rede-yellow'>
                Fazer Login
            </Link>
        </Text>
    </div>
);

/** Passo 1: o email da conta, para onde segue o link. */
const RequestResetForm: React.FC<{ intro: string }> = ({ intro }) => {
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [turnstileToken, setTurnstileToken] = useState("");
    const turnstileRef = useRef<TurnstileHandle>(null);

    const needsTurnstile = Boolean(TURNSTILE_SITE_KEY);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSending || cooldown > 0) return;

        const normalizedEmail = email.trim();
        if (!validateEmail(normalizedEmail)) {
            setFeedback({ ok: false, message: "Indique um email válido." });
            return;
        }

        setIsSending(true);
        setFeedback(null);

        const response = await requestPasswordReset(normalizedEmail, turnstileToken);

        // Cada token do captcha so vale uma vez.
        turnstileRef.current?.reset();
        setIsSending(false);

        if (response.error) {
            setFeedback({ ok: false, message: response.message || "Não foi possível enviar o pedido." });
            return;
        }

        setFeedback({ ok: true, message: response.message || "Se existir uma conta com este email, enviámos um link." });
        setCooldown(COOLDOWN_SECONDS);
    };

    const canSubmit = !isSending && cooldown === 0 && (!needsTurnstile || turnstileToken.length > 0);

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className='w-full flex flex-col gap-6'>
                <Text className='text-[14px] leading-5 text-center'>{intro}</Text>

                <div className='flex flex-col gap-2'>
                    <label className='text-[20px] leading-7' htmlFor='resetEmailField'>Email</label>
                    <Input variant={"secondary"} type='email' autoComplete='email' placeholder='seu@email.com' className='w-full' id='resetEmailField' value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>

                <FeedbackText feedback={feedback} />

                {needsTurnstile && <TurnstileWidget ref={turnstileRef} onTokenChange={setTurnstileToken} />}

                <Button type='submit' containerClassName='w-full' className='text-rede-surface' disabled={!canSubmit}>
                    {isSending ? "A enviar..." : cooldown > 0 ? `Enviar novamente (${cooldown}s)` : "Enviar link"}
                </Button>
            </div>
            <BackToLogin />
        </form>
    );
};

/** Passo 2: a nova palavra-passe, a partir do link do email. */
const NewPasswordForm: React.FC<{ token: string }> = ({ token }) => {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isDone, setIsDone] = useState(false);
    // O back recusou o link (expirado ou ja usado): so resta pedir um novo.
    const [rejectedMessage, setRejectedMessage] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving) return;

        const passwordError = validateNewPassword(password, confirmation);
        if (passwordError) {
            setFeedback({ ok: false, message: passwordError });
            return;
        }

        setIsSaving(true);
        setFeedback(null);

        const response = await resetPassword(token, password);

        setIsSaving(false);

        if (response.error === "RESET_TOKEN_INVALID") {
            setRejectedMessage(response.message || "Este link já não é válido.");
            return;
        }

        if (response.error) {
            setFeedback({ ok: false, message: response.message || "Não foi possível atualizar a palavra-passe." });
            return;
        }

        setIsDone(true);
    };

    if (rejectedMessage) {
        return <RequestResetForm intro={`${rejectedMessage} Indique o email da sua conta para receber um novo link.`} />;
    }

    if (isDone) {
        return (
            <div className='w-full flex flex-col gap-6'>
                <Text role="status" className='text-[14px] leading-5 text-center text-rede-yellow'>
                    Palavra-passe atualizada com sucesso. Já pode entrar com a nova palavra-passe.
                </Text>
                <Button type='button' containerClassName='w-full' className='text-rede-surface' onClick={() => router.push("/login")}>
                    Fazer Login
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className='w-full flex flex-col gap-6'>
                <Text className='text-[14px] leading-5 text-center'>
                    Escolha a nova palavra-passe da sua conta.
                </Text>

                <NewPasswordFields
                    password={password}
                    confirmation={confirmation}
                    onPasswordChange={setPassword}
                    onConfirmationChange={setConfirmation}
                />

                <FeedbackText feedback={feedback} />

                <Button type='submit' containerClassName='w-full' className='text-rede-surface' disabled={isSaving}>
                    {isSaving ? "A guardar..." : "Guardar palavra-passe"}
                </Button>
            </div>
        </form>
    );
};

/**
 * Recuperar o acesso: sem token, pede o email para enviar o link; com o token
 * do link do email, define a nova palavra-passe.
 */
export const ResetPassword: React.FC<{ token: string }> = ({ token }) =>
    token ? (
        <NewPasswordForm token={token} />
    ) : (
        <RequestResetForm intro="Indique o email da sua conta. Enviamos um link para definir uma nova palavra-passe." />
    );
