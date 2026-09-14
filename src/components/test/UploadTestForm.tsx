"use client";

import Link from "next/link";
import {
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE_MB,
} from "@/actions/constants";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { FileUploadField, type FileUploadFieldProps } from "./FileUploadField";

const uploadFields: FileUploadFieldProps[] = [
  {
    label: "Imagem de perfil",
    description: "JPG, PNG, WEBP ou GIF. Guardada em avatars/.",
    purpose: "profile-image",
    accept: ACCEPTED_IMAGE_TYPES,
  },
  {
    label: "Imagem de capa",
    description: "JPG, PNG, WEBP ou GIF. Guardada em covers/.",
    purpose: "cover-image",
    accept: ACCEPTED_IMAGE_TYPES,
  },
  {
    label: "Documento",
    description: "PDF, DOC ou DOCX. Guardado em documents/.",
    purpose: "document",
    accept: ACCEPTED_DOCUMENT_TYPES,
  },
  {
    label: "Qualquer ficheiro",
    description: "Sem filtro no browser, para confirmar que a API recusa tipos não permitidos.",
    purpose: "document",
  },
];

export function UploadTestForm() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Heading level="h2">Teste de uploads</Heading>
        <Text className="text-foreground/70">
          Imagens e documentos até {MAX_UPLOAD_SIZE_MB}MB. Ficheiros acima do limite são enviados na
          mesma, para confirmar que é a API a recusá-los.
        </Text>
      </header>

      {!loading && !isAuthenticated && (
        <div className="rounded-xl border border-rede-red/40 p-4">
          <Text variant="body2">
            Precisas de ter sessão iniciada para enviar ficheiros.{" "}
            <Link href="/login" className="text-rede-yellow underline">
              Iniciar sessão
            </Link>
          </Text>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {uploadFields.map((field) => (
          <FileUploadField key={field.label} {...field} />
        ))}
      </div>
    </div>
  );
}
