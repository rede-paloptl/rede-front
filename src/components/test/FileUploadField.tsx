"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { deleteFile, getFileDownloadUrl, uploadFile } from "@/actions/files";
import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from "@/actions/constants";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { FilePurpose, StoredFile } from "@/types/File";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export type FileUploadFieldProps = {
  label: string;
  description: string;
  purpose: FilePurpose;
  accept?: string;
};

const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export function FileUploadField({ label, description, purpose, accept }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [storedFile, setStoredFile] = useState<StoredFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isUploading = status === "uploading";
  const isOverLimit = file ? file.size > MAX_UPLOAD_SIZE_BYTES : false;

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setMessage(null);
    setStoredFile(null);
    setPreviewUrl(null);
  };

  const fail = (errorMessage?: string) => {
    setStatus("error");
    setMessage(errorMessage ?? "Ocorreu um erro inesperado.");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    reset();
  };

  // De proposito nao bloqueamos ficheiros acima do limite: o objectivo e
  // confirmar que e a API a recusa-los.
  const handleUpload = async () => {
    if (!file) return;

    reset();
    setStatus("uploading");

    const response = await uploadFile(file, purpose, setProgress);

    if (response.error || !response.data) {
      fail(response.unauthorized ? "Sessão expirada. Inicia sessão novamente." : response.message);
      return;
    }

    setStoredFile(response.data.file);
    setStatus("success");
    setMessage(response.message ?? null);

    if (response.data.file.mimeType.startsWith("image/")) {
      const download = await getFileDownloadUrl(response.data.file.key);
      if (download.data) setPreviewUrl(download.data.url);
    }
  };

  const handleOpen = async () => {
    if (!storedFile) return;

    const response = await getFileDownloadUrl(storedFile.key);

    if (response.error || !response.data) {
      fail(response.message);
      return;
    }

    window.open(response.data.url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    if (!storedFile) return;

    const response = await deleteFile(storedFile.key);

    if (response.error) {
      fail(response.message);
      return;
    }

    reset();
    setFile(null);
    setMessage(response.message ?? null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-rede-bg-800 p-6">
      <div className="flex flex-col gap-1">
        <Text className="font-semibold">{label}</Text>
        <Text variant="caption" className="text-foreground/60">{description}</Text>
      </div>

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/20 px-4 py-8 text-center transition-colors hover:border-rede-yellow",
          isUploading && "pointer-events-none opacity-60",
        )}
      >
        <Upload className="h-6 w-6 text-rede-yellow" />
        <Text variant="body2" className="break-all">
          {file ? file.name : "Clica para escolher um ficheiro"}
        </Text>
        {file && (
          <Text variant="caption" className={isOverLimit ? "text-rede-red" : "text-foreground/60"}>
            {formatFileSize(file.size)}
            {isOverLimit && ` · acima de ${MAX_UPLOAD_SIZE_MB}MB, a API deve recusar`}
          </Text>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </label>

      {isUploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full bg-rede-yellow transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {message && (
        <Text
          variant="body2"
          role="status"
          className={status === "error" ? "text-rede-red" : "text-rede-yellow"}
        >
          {message}
        </Text>
      )}

      {storedFile && (
        <div className="flex flex-col gap-1 rounded-lg bg-rede-bg-900 p-3">
          <Text variant="caption" className="break-all text-foreground/60">key: {storedFile.key}</Text>
          <Text variant="caption" className="text-foreground/60">
            {storedFile.mimeType} · {formatFileSize(storedFile.size)}
          </Text>
        </div>
      )}

      {previewUrl && (
        <img src={previewUrl} alt={storedFile?.originalName ?? label} className="max-h-48 w-full rounded-lg object-contain" />
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? `A enviar ${progress}%` : "Enviar"}
        </Button>
        {storedFile && (
          <>
            <Button type="button" size="sm" variant="secondary" onClick={handleOpen}>
              Abrir
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={handleDelete}>
              Apagar
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
