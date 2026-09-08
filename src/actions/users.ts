"use client";

import { api } from "@/lib/api";
import { User } from "@/types/User";

export type NetworkUser = Omit<User, "profileData"> & {
  id?: string;
  _id?: string;
  profileData?: User["profileData"] | null;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  imageUrl?: string | null;
  password?: string;
  // Parcial: o servidor funde este patch com o perfil ja gravado.
  profileData?: Partial<User["profileData"]> | null;
};

export type GetLoggedUserResponseType = {
  error?: string;
  message?: string;
  /** O servidor recusou o token: a sessao local ja nao vale nada. */
  unauthorized?: boolean;
  data?: {
    user?: User;
  };
};

export type UpdateUserResponseType = {
  error?: string;
  message?: string;
  unauthorized?: boolean;
  data?: {
    user?: User;
  };
};

export type DeleteUserResponseType = {
  error?: string;
  message?: string;
  unauthorized?: boolean;
};

export type GetUsersResponseType = {
  error?: string;
  message?: string;
  data?: {
    users: NetworkUser[];
  };
};

type UsersApiResponse = {
  error?: string;
  message?: string;
  users?: NetworkUser[];
  data?: {
    users?: NetworkUser[];
  };
};

type ApiError = {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
};

const getApiError = (err: unknown): ApiError => {
  return typeof err === "object" && err !== null ? err as ApiError : {};
};

/**
 * O token foi recusado pelo servidor (expirou, foi revogado ou nunca seguiu).
 * Nestes casos nao ha nada a tentar de novo: a sessao local tem de cair.
 */
const isUnauthorized = (apiError: ApiError): boolean => {
  const status = apiError.response?.status;

  return status === 401 || status === 403;
};

const normalizeUsersResponse = (data: UsersApiResponse | NetworkUser[]): NetworkUser[] => {
  if (Array.isArray(data)) return data;

  return data.users ?? data.data?.users ?? [];
};

export const getUsers = async (): Promise<GetUsersResponseType> => {
  try {
    const responseData = await fetch("/api/users", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await responseData.json() as UsersApiResponse | NetworkUser[];

    if (!responseData.ok) {
      return {
        error:
          Array.isArray(data)
            ? "Erro desconhecido"
            : data.error || "Erro desconhecido",
        message:
          Array.isArray(data)
            ? "Não foi possível carregar os Usuários."
            : data.message || "Não foi possível carregar os Usuários.",
      };
    }

    return {
      data: {
        users: normalizeUsersResponse(data),
      },
    };
  } catch (err: unknown) {
    const apiError = getApiError(err);

    return {
      error:
        apiError.response?.data?.error ||
        "Erro desconhecido",
      message:
        apiError.response?.data?.message ||
        "Não foi possível carregar os Usuários.",
    };
  }
};

/**
 * Le o perfil do utilizador autenticado directamente da API.
 *
 * E a fonte da verdade: o localStorage pode estar desactualizado (outro
 * dispositivo, outro separador, sessao antiga) e nunca deve servir de base
 * para gravar.
 */
export const getLoggedUser = async (): Promise<GetLoggedUserResponseType> => {
  try {
    const responseData = await api.get("/api/v1/users/me");

    return {
      data: responseData.data?.user
        ? {
          user: responseData.data.user,
        }
        : undefined,
      message: responseData.data?.message,
    };
  } catch (err: unknown) {
    const apiError = getApiError(err);

    return {
      error:
        apiError.response?.data?.error ||
        "Erro desconhecido",
      message:
        apiError.response?.data?.message ||
        "Não foi possível carregar os dados do perfil.",
      unauthorized: isUnauthorized(apiError),
    };
  }
};

export const updateLoggedUser = async (
  data: UpdateUserInput
): Promise<UpdateUserResponseType> => {
  try {
    const responseData = await api.patch(
      "/api/v1/users/me",
      data
    );

    return {
      data: responseData.data?.user
        ? {
          user: responseData.data.user,
        }
        : undefined,
      message:
        responseData.data?.message ||
        "Dados atualizados com sucesso.",
    };
  } catch (err: unknown) {
    const apiError = getApiError(err);

    return {
      error:
        apiError.response?.data?.error ||
        "Erro desconhecido",
      message:
        apiError.response?.data?.message ||
        "Não foi possível atualizar os dados.",
      unauthorized: isUnauthorized(apiError),
    };
  }
};

export const deleteLoggedUser = async (): Promise<DeleteUserResponseType> => {
  try {
    const responseData = await api.delete(
      "/api/v1/users/me"
    );

    return {
      message:
        responseData.data?.message ||
        "Usuário apagado com sucesso.",
    };
  } catch (err: unknown) {
    const apiError = getApiError(err);

    return {
      error:
        apiError.response?.data?.error ||
        "Erro desconhecido",
      message:
        apiError.response?.data?.message ||
        "Não foi possível apagar o Usuário.",
      unauthorized: isUnauthorized(apiError),
    };
  }
};
