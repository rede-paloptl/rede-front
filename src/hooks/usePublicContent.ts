"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PublicContentResponse } from "@/actions/publicContent";

export type PublicContentState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  retry: () => void;
};

/**
 * Carrega conteudo publico ao montar (e sempre que `key` muda, ex: o id de
 * uma noticia). Respostas que chegam depois de o componente mudar de pedido
 * sao ignoradas.
 */
export function usePublicContent<T>(
  load: () => Promise<PublicContentResponse<T>>,
  key = "",
): PublicContentState<T> {
  const [state, setState] = useState<Omit<PublicContentState<T>, "retry">>({
    data: null,
    isLoading: true,
    error: null,
    notFound: false,
  });
  const [attempt, setAttempt] = useState(0);

  // Guardado em ref: quem chama passa funcoes inline, que mudam a cada render.
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let isCurrent = true;

    void loadRef.current().then((response) => {
      if (!isCurrent) return;

      setState({
        data: response.data ?? null,
        isLoading: false,
        error: response.data ? null : response.message ?? "Não foi possível carregar o conteúdo.",
        notFound: Boolean(response.notFound),
      });
    });

    return () => {
      isCurrent = false;
    };
  }, [key, attempt]);

  const retry = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true, error: null, notFound: false }));
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
