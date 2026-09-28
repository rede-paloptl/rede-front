'use server'

import { api } from '@/lib/api'
import { LoggedUser, User } from '@/types/User'
import { headers } from 'next/headers'

export type ConfirmationBaseUrlPayload = {
  confirmationBaseUrl?: string;
}

export type SignupPayload = User & ConfirmationBaseUrlPayload & {
  // Presente quando loginType === "google"; o backend verifica-o.
  idToken?: string;
  // Cloudflare Turnstile, exigido no signup por email.
  turnstileToken?: string;
};

const getRequestBaseUrl = async () => {
  try {
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin");

    if (origin) return origin;

    const referer = requestHeaders.get("referer");

    if (referer) {
      return new URL(referer).origin;
    }

    const forwardedProto = requestHeaders.get("x-forwarded-proto") ?? "https";
    const forwardedHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

    return forwardedHost ? `${forwardedProto}://${forwardedHost}` : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Estas actions correm no servidor do Next, por isso a API veria o IP e a
 * localizacao da Vercel. Reencaminhamos os do browser para o historico de
 * sessoes e o email de alerta. O segredo prova a API que vem de nos.
 */
const getClientForwardHeaders = async (): Promise<Record<string, string>> => {
  try {
    const requestHeaders = await headers();
    const forwarded: Record<string, string> = {};

    const set = (name: string, value: string | null | undefined) => {
      if (value) forwarded[name] = value;
    };

    const clientIp =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      requestHeaders.get("x-real-ip");

    set("x-client-ip", clientIp);
    set("x-client-user-agent", requestHeaders.get("user-agent"));
    set("x-client-country", requestHeaders.get("x-vercel-ip-country"));
    set("x-client-region", requestHeaders.get("x-vercel-ip-country-region"));
    set("x-client-city", requestHeaders.get("x-vercel-ip-city"));
    set("x-client-origin", await getRequestBaseUrl());
    set("x-internal-secret", process.env.INTERNAL_API_SECRET);

    return forwarded;
  } catch {
    return {};
  }
}

export type SignupResponseType = {
  error?: string;
  message?: string;
  data?: {
    user: User;
    requiresEmailConfirmation: boolean;
  };
}

export const signup = async (user: SignupPayload): Promise<SignupResponseType> => {
  try {
    const responseData = await api.post("/api/v1/auth/signup", {
      ...user,
      confirmationBaseUrl: user.confirmationBaseUrl ?? await getRequestBaseUrl(),
    });
    if (responseData.data) {
      const { user, requiresEmailConfirmation } = responseData.data;
      return {
        data: { user, requiresEmailConfirmation }
      }
    }

    return {
      message: "Erro desconhecido",
      error: "",
      data: undefined
    };
  } catch (err: any) {
    const data = err.response?.data;
    console.error("[signup] falhou:", err.response?.status ?? err.code, data ?? err.message);

    // Sem resposta = a API nao respondeu (desligada / URL errada).
    if (!err.response) {
      return {
        error: "NETWORK_ERROR",
        message: "Não foi possível ligar ao servidor. Tente novamente dentro de instantes."
      }
    }

    const fieldErrors = Array.isArray(data?.details)
      ? data.details.map((detail: { field?: string; message?: string }) => detail.field || detail.message).filter(Boolean).join(", ")
      : "";

    return {
      error: data?.error || "Erro desconhecido",
      message: data?.message
        ? fieldErrors ? `${data.message} (${fieldErrors})` : data.message
        : "Não foi possível realizar o cadastro"
    }
  }
}


export type ResendConfirmationResponseType = {
  message?: string;
  error?: string;
}

export const resendConfirmationEmail = async (email: string, payload: ConfirmationBaseUrlPayload = {}): Promise<ResendConfirmationResponseType> => {
  try {
    const responseData = await api.post<ResendConfirmationResponseType>("/api/v1/auth/resend-confirmation", {
      email,
      confirmationBaseUrl: payload.confirmationBaseUrl ?? await getRequestBaseUrl(),
    });
    return { message: responseData.data?.message }
  } catch (err: any) {
    return {
      error: err.response?.data?.error || "Erro desconhecido",
      message: err.response?.data?.message || "Não foi possível reenviar o email de confirmação"
    }
  }
}


type ConfirmResponseType = {
  user?: LoggedUser;
  token?: string;
  message?: string;
  error?: string;
}

export const confirmAccountAndChangePassword = async (token: string, password: string): Promise<ConfirmResponseType> => {
  try {
    const responseData = await api.post<ConfirmResponseType>("/api/v1/auth/confirm-email-setpassword", { token, password }, {
      headers: await getClientForwardHeaders(),
    });
    if (responseData.data) {
      const { user, token } = responseData.data;
      return { user, token }
    }

    return {
      message: "Erro desconhecido",
      error: "",
      user: undefined
    };
  } catch (err: any) {
    return {
      error: err.response?.data?.error || "Erro desconhecido",
      message: err.response?.data?.message || "Não foi possível realizar a operação"
    }
  }
}


export type LoginUsingEmailAndPassResponseType = {
  user?: LoggedUser;
  token?: string;
  message?: string;
  error?: string;
}

export const loginUsingEmailAndPassword = async (email: string, password: string, turnstileToken?: string): Promise<LoginUsingEmailAndPassResponseType> => {
  try {
    const responseData = await api.post<LoginUsingEmailAndPassResponseType>("/api/v1/auth/login-using-email-and-password", { email, password, turnstileToken: turnstileToken || undefined }, {
      headers: await getClientForwardHeaders(),
    });
    const { data: user, token } = responseData.data as LoginUsingEmailAndPassResponseType & { data?: LoggedUser };

    return { user, token }
  } catch (err: any) {
    return {
      error: err.response?.data?.error || "Erro desconhecido",
      message: err.response?.data?.message || "Não foi possível iniciar sessão"
    }
  }
}


export type GoogleLoginPayload = {
  idToken: string;
}

export const loginUsingGoogle = async ({ idToken }: GoogleLoginPayload): Promise<LoginUsingEmailAndPassResponseType> => {
  try {
    const responseData = await api.post<LoginUsingEmailAndPassResponseType>("/api/v1/auth/login-using-google", { idToken }, {
      headers: await getClientForwardHeaders(),
    });
    const { data: user, token } = responseData.data as LoginUsingEmailAndPassResponseType & { data?: LoggedUser };

    return { user, token }
  } catch (err: any) {
    return {
      error: err.response?.data?.error || "Erro desconhecido",
      message: err.response?.data?.message || "Não foi possível iniciar sessão com o Google"
    }
  }
}