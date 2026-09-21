import { Plus } from "lucide-react";
import { customBlur } from "@/app/fonts";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Dispatch, Fragment, SetStateAction, useMemo, useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Textarea } from "@/components/ui/textarea";

const BIO_MAX_LENGTH = 1300;
const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

type SectionEditBioProps = {
  isAuthenticated?: boolean;
  isEditingBio?: boolean;
  setIsEditingBio?: Dispatch<SetStateAction<boolean>>;
  bio?: string;
  isSaving?: boolean;
  onSaveBio?: (bio: string) => void | Promise<void>;
}

const getLinkHref = (url: string) => {
  return url.startsWith("www.") ? `https://${url}` : url;
};

const renderBioWithLinks = (text: string) => {
  const parts = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const url = match[0];
    const index = match.index ?? 0;
    const trailingPunctuation = url.match(/[.,!?;:)]+$/)?.[0] ?? "";
    const cleanUrl = trailingPunctuation ? url.slice(0, -trailingPunctuation.length) : url;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <a
        key={`${cleanUrl}-${index}`}
        className="underline underline-offset-2 hover:text-rede-yellow"
        href={getLinkHref(cleanUrl)}
        target="_blank"
        rel="noreferrer"
      >
        {cleanUrl}
      </a>
    );

    if (trailingPunctuation) {
      parts.push(trailingPunctuation);
    }

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) => (
    <Fragment key={typeof part === "string" ? `${part}-${index}` : part.key}>
      {part}
    </Fragment>
  ));
};

export const SectionEditBio: React.FC<SectionEditBioProps> = ({
  isAuthenticated,
  isEditingBio = false,
  setIsEditingBio,
  bio = "",
  isSaving = false,
  onSaveBio,
}) => {
  const [draftBio, setDraftBio] = useState(bio);
  const remainingCharacters = BIO_MAX_LENGTH - draftBio.length;
  const formattedBio = useMemo(() => renderBioWithLinks(bio), [bio]);

  const handleStartEditing = () => {
    setDraftBio(bio);
    setIsEditingBio?.(true);
  };

  const toggleEditing = () => setIsEditingBio?.((lastState) => !lastState);

  const handleSave = () => {
    void onSaveBio?.(draftBio.slice(0, BIO_MAX_LENGTH));
  };

  const handleCancel = () => {
    setDraftBio(bio);
    toggleEditing();
  };

  return (
    <div className="w-1/2 flex flex-col h-auto">
      <div className="flex items-center gap-4 mb-5">
        <Heading className={`${customBlur.className} text-[48px] leading-12`}>
          Biografia
        </Heading>

        {isAuthenticated && isEditingBio && (
          <div className="w-full flex gap-1">
            <Button disabled={isSaving} onClick={handleSave}>{isSaving ? "A guardar..." : "Guardar"}</Button>
            <Button variant="secondary" disabled={isSaving} onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {isEditingBio ? (
        <div className="w-full">
          <Textarea
            className="w-full min-h-37.5"
            maxLength={BIO_MAX_LENGTH}
            value={draftBio}
            onChange={(e) => setDraftBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
          />

          <Text className="mt-2 text-[12px] leading-none text-foreground/60" as="span">
            {draftBio.length}/{BIO_MAX_LENGTH} caracteres usados - {remainingCharacters} restantes
          </Text>
        </div>
      ) : isAuthenticated ? (
        // Sem passo "Editar": o dono clica no texto e escreve logo.
        bio.trim() ? (
          <div
            role="button"
            tabIndex={0}
            title="Clique para editar a biografia"
            aria-label="Editar biografia"
            onClick={(event) => {
              // Os links da biografia continuam a abrir normalmente.
              if ((event.target as HTMLElement).closest("a")) return;
              handleStartEditing();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleStartEditing();
              }
            }}
            className="w-[94%] cursor-text rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-rede-yellow"
          >
            <Text className="whitespace-pre-wrap break-words text-[14px] leading-relaxed font-medium">
              {formattedBio}
            </Text>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="w-fit"
            icon={<Plus width={12} height={12} aria-hidden="true" />}
            iconPosition="left"
            onClick={handleStartEditing}
          >
            Adicionar biografia
          </Button>
        )
      ) : (
        bio.trim() ? (
          <Text className="w-[94%] whitespace-pre-wrap break-words text-[14px] leading-relaxed font-medium">
            {formattedBio}
          </Text>
        ) : (
          <Text className="text-[14px] leading-relaxed font-medium">Ainda não existe biografia.</Text>
        )
      )}
    </div>
  );
};
