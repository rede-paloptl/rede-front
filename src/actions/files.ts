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
 * Envia o ficheiro para a API, que o guarda no R2.
 *
 * Tamanho e tipo sao validados no servidor (2MB; imagens ou documentos
 * conforme o `purpose`). Imagens voltam com `publicUrl` permanente, que e o
 * valor a gravar no perfil.
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
      unauthorized: apiError.response?.status === 401,
      tooLarge: apiError.response?.status === 413,
    };
  }
};
