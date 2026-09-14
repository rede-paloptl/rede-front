"use client";

import { api } from "@/lib/api";
import type { FilePurpose, StoredFile } from "@/types/File";

export type UploadFileResponseType = {
  error?: string;
  message?: string;
  unauthorized?: boolean;
  /** A API recusou o ficheiro por passar do limite de tamanho. */
  tooLarge?: boolean;
  data?: {
    file: StoredFile;
  };
};

export type GetFileDownloadUrlResponseType = {
  error?: string;
  message?: string;
  unauthorized?: boolean;
  data?: {
    url: string;
  };
};

export type DeleteFileResponseType = {
  error?: string;
  message?: string;
  unauthorized?: boolean;
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

const isUnauthorized = (apiError: ApiError): boolean => {
  const status = apiError.response?.status;

  return status === 401;
};

/**
 * Envia o ficheiro para a API, que o guarda no R2.
 *
 * O limite de tamanho e validado no servidor: mesmo que o browser deixe
 * escolher um ficheiro maior, a API responde 413 e a mensagem segue em
 * `message`.
 */
export const uploadFile = async (
  file: File,
  purpose: FilePurpose,
  onProgress?: (percent: number) => void
): Promise<UploadFileResponseType> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const responseData = await api.post<{ file: StoredFile }>(
      "/api/v1/files/upload",
      formData,
      {
        params: { purpose },
        // Sem isto o axios usa o application/json da instancia e converte o
        // FormData em JSON. O browser acrescenta o boundary sozinho.
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      }
    );

    return {
      data: {
        file: responseData.data.file,
      },
      message: "Ficheiro enviado com sucesso.",
    };
  } catch (err: unknown) {
    const apiError = getApiError(err);

    return {
      error:
        apiError.response?.data?.error ||
        "Erro desconhecido",
      message:
        apiError.response?.data?.message ||
        "Não foi possível enviar o ficheiro.",
      unauthorized: isUnauthorized(apiError),
      tooLarge: apiError.response?.status === 413,
    };
  }
};

/** URL temporaria (1h) para abrir um ficheiro privado do utilizador. */
export const getFileDownloadUrl = async (
  key: string
): Promise<GetFileDownloadUrlResponseType> => {
  try {
    const responseData = await api.get<{ url: string }>(
      "/api/v1/files/download-url",
      { params: { key } }
    );

    return {
      data: {
        url: responseData.data.url,
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
        "Não foi possível abrir o ficheiro.",
      unauthorized: isUnauthorized(apiError),
    };
  }
};

export const deleteFile = async (key: string): Promise<DeleteFileResponseType> => {
  try {
    await api.delete("/api/v1/files", { data: { key } });

    return {
      message: "Ficheiro apagado com sucesso.",
    };
  } catch (err: unknown) {
    const apiError = getApiError(err);

    return {
      error:
        apiError.response?.data?.error ||
        "Erro desconhecido",
      message:
        apiError.response?.data?.message ||
        "Não foi possível apagar o ficheiro.",
      unauthorized: isUnauthorized(apiError),
    };
  }
};
