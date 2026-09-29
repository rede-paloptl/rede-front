"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Sem site key o widget nao aparece e o backend tambem nao exige o token. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

type TurnstileRenderOptions = {
    sitekey: string;
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    size?: 'normal' | 'flexible' | 'compact';
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: () => void;
};

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

let scriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
    if (window.turnstile) return Promise.resolve();

    if (!scriptPromise) {
        scriptPromise = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = TURNSTILE_SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => {
                scriptPromise = null;
                reject(new Error('Não foi possível carregar a verificação anti-robô.'));
            };
            document.head.appendChild(script);
        });
    }

    return scriptPromise;
};

export type TurnstileHandle = {
    /** Os tokens so valem uma vez: depois de cada tentativa pede-se um novo. */
    reset: () => void;
};

type TurnstileWidgetProps = {
    /** Recebe o token quando valido, ou "" quando expira/falha. */
    onTokenChange: (token: string) => void;
};

// Cloudflare Turnstile ("I'm not a robot"). O token e validado no rede-back.
export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(({ onTokenChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const onTokenChangeRef = useRef(onTokenChange);
    useEffect(() => {
        onTokenChangeRef.current = onTokenChange;
    });

    useImperativeHandle(ref, () => ({
        reset: () => {
            onTokenChangeRef.current('');
            if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
        },
    }), []);

    useEffect(() => {
        if (!TURNSTILE_SITE_KEY || !containerRef.current) return;

        const container = containerRef.current;
        let cancelled = false;

        loadTurnstileScript()
            .then(() => {
                if (cancelled || !window.turnstile) return;

                widgetIdRef.current = window.turnstile.render(container, {
                    sitekey: TURNSTILE_SITE_KEY,
                    theme: 'dark',
                    language: 'pt',
                    size: 'flexible',
                    callback: (token) => onTokenChangeRef.current(token),
                    'expired-callback': () => onTokenChangeRef.current(''),
                    'error-callback': () => onTokenChangeRef.current(''),
                });
            })
            .catch((err) => console.error('[turnstile]', err));

        return () => {
            cancelled = true;
            if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
            widgetIdRef.current = null;
        };
    }, []);

    if (!TURNSTILE_SITE_KEY) return null;

    return <div ref={containerRef} className='w-full min-h-[65px]' />;
});

TurnstileWidget.displayName = 'TurnstileWidget';
