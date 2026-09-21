"use client"

import { FormEvent, useEffect, useState } from 'react';
import { validateEmail } from '@/actions';
import { resendConfirmationEmail } from '@/actions/authentication';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { Text } from '../ui/text';

// Igual ao intervalo minimo entre envios no back-end
const COOLDOWN_SECONDS = 60;

type Props = {
    /** Email ja conhecido (logo apos o signup). Sem ele, o email e pedido ao utilizador. */
    email?: string;
    /** Comeca em espera, porque o email de confirmacao acabou de ser enviado. */
    startWithCooldown?: boolean;
}

export const ResendConfirmation: React.FC<Props> = ({ email: knownEmail, startWithCooldown = false }) => {
    const [email, setEmail] = useState(knownEmail ?? "");
    const [cooldown, setCooldown] = useState(startWithCooldown ? COOLDOWN_SECONDS : 0);
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (cooldown > 0 || isSending) return;

        const normalizedEmail = email.trim();
        if (!validateEmail(normalizedEmail)) {
            setFeedback({ ok: false, message: "Indique um email válido." });
            return;
        }

        setIsSending(true);
        setFeedback(null);

        const response = await resendConfirmationEmail(normalizedEmail, { confirmationBaseUrl: window.location.origin });

        setIsSending(false);

        if (response.error) {
            setFeedback({ ok: false, message: response.message || "Não foi possível reenviar o email." });
            return;
        }

        setFeedback({ ok: true, message: response.message || "Enviámos um novo link de confirmação." });
        setCooldown(COOLDOWN_SECONDS);
    }

    return (
        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-3'>
            {!knownEmail && (
                <div className='flex flex-col gap-2'>
                    <label className='text-[20px] leading-7' htmlFor='resendEmailField'>Email</label>
                    <Input variant={"secondary"} type='email' placeholder='seu@email.com' className='w-full' id='resendEmailField' value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
            )}

            {feedback && (
                <Text className={`text-[14px] leading-5 text-center ${feedback.ok ? "text-rede-yellow" : "text-rede-red"}`}>
                    {feedback.message}
                </Text>
            )}

            <Button type='submit' variant={"secondary"} className='w-full' containerClassName='w-full' disabled={isSending || cooldown > 0}>
                {isSending ? "A enviar..." : cooldown > 0 ? `Reenviar email (${cooldown}s)` : "Reenviar email"}
            </Button>
        </form>
    )
}
