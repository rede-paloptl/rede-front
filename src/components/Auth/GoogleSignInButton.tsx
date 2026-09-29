"use client"

import { useEffect, useRef, useState } from 'react';
import { GoogleButtonOptions, GoogleSignInResult, renderGoogleButton } from '@/lib/googleAuth';
import { GoogleIcon } from '@/icons/GoogleIcon';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

type GoogleSignInButtonProps = {
    onSuccess: (result: GoogleSignInResult) => void;
    onError?: (message: string) => void;
    text?: GoogleButtonOptions['text'];
    label?: string;
    disabled?: boolean;
};

// O Google so aceita larguras entre 200 e 400px.
const clampWidth = (width: number) => Math.max(200, Math.min(400, Math.floor(width)));

/**
 * Mostra o nosso botao "Continue com Google" e coloca por cima, invisivel,
 * o botao oficial do Google: o clique cai no iframe do Google (que abre o
 * popup de conta) mas o utilizador ve o design da REDE.
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError, text = 'continue_with', label = "Continue com Google", disabled = false }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [loadError, setLoadError] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    // Refs para o callback do Google ver sempre os handlers mais recentes.
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    });

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const button = buttonRef.current;
        if (!wrapper || !button) return;

        let cleanup: (() => void) | undefined;
        let cancelled = false;

        renderGoogleButton(
            button,
            (result) => onSuccessRef.current(result),
            { text, width: clampWidth(wrapper.clientWidth) },
        )
            .then((dispose) => {
                if (cancelled) dispose();
                else cleanup = dispose;
            })
            .catch((err) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Não foi possível carregar o Google Sign-In.";
                setLoadError(message);
                onErrorRef.current?.(message);
            });

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, [text]);

    const isDisabled = disabled || loadError.length > 0;

    return (
        <div className='w-full flex flex-col items-center gap-2'>
            <div
                ref={wrapperRef}
                className='relative w-full'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Button
                    type='button'
                    variant={"secondary"}
                    icon={<GoogleIcon width={12} height={12} />}
                    className='w-full'
                    containerClassName='w-full pointer-events-none'
                    disabled={isDisabled}
                    isActive={isHovered && !isDisabled}
                    tabIndex={-1}
                    aria-hidden
                >
                    {label}
                </Button>

                {/* Botao real do Google, transparente e esticado por cima do nosso. */}
                <div
                    ref={buttonRef}
                    aria-label={label}
                    className={`absolute inset-0 flex items-center justify-center overflow-hidden opacity-0 scale-y-150 ${isDisabled ? 'pointer-events-none' : 'cursor-pointer'}`}
                />
            </div>
            {loadError.length > 0 &&
                <Text className='text-[14px] leading-5 text-rede-red text-center'>{loadError}</Text>
            }
        </div>
    );
};
