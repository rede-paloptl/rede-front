'use server'

import { api } from '@/lib/api'
import { LoggedUser, User } from '@/types/User'
import { headers } from 'next/headers'

export type ConfirmationBaseUrlPayload = {
  confirmationBaseUrl?: string;
}

export type SignupPayload = User & ConfirmationBaseUrlPayload;

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
    return {
      error: err.response?.data?.error || "Erro desconhecido",
      message: err.response?.data?.message || "Não foi possível realizar o cadastro"
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
    const responseData = await api.post<ConfirmResponseType>("/api/v1/auth/confirm-email-setpassword", { token, password });
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

export const loginUsingEmailAndPassword = async (email: string, password: string): Promise<LoginUsingEmailAndPassResponseType> => {
  try {
    const responseData = await api.post<LoginUsingEmailAndPassResponseType>("/api/v1/auth/login-using-email-and-password", { email, password });
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
    const responseData = await api.post<LoginUsingEmailAndPassResponseType>("/api/v1/auth/login-using-google", { idToken });
    const { data: user, token } = responseData.data as LoginUsingEmailAndPassResponseType & { data?: LoggedUser };

    return { user, token }
  } catch (err: any) {
    return {
      error: err.response?.data?.error || "Erro desconhecido",
      message: err.response?.data?.message || "Não foi possível iniciar sessão com o Google"
    }
  }
}