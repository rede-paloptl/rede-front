"use client";

import { useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { customBlur } from "@/app/fonts";
import { AccountType, ProfileAchievement, ProfileFilm } from "@/types/User";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "../ui/button";
import { FilmCard, FilmCardType } from "../FilmCard";
import { AddFilmModal, FilmFormData } from "../AddFilmModal";

import { FilmDetailsModal } from "./FilmDetailsModal";

const FILM_PLACEHOLDER_COVER = "/assets/placeholder-img.jpg";

type LocalFilmCardProps = {
  film: FilmCardType;
  canManage: boolean;
  disabled: boolean;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onOpen: (id: string) => void;
};

const FilmCardLocal: React.FC<LocalFilmCardProps> = ({
  film,
  canManage,
  disabled,
  onEdit,
  onRemove,
  onOpen,
}) => (
  // Clicar no cartao abre o detalhe do filme; a seta (abre o link) e os
  // botoes de editar/remover mantem o seu proprio comportamento.
  <div
    role="button"
    tabIndex={0}
    aria-label={`Ver detalhes do filme ${film.title}`}
    className="relative w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-rede-white/80"
    onClick={(event) => {
      if ((event.target as HTMLElement).closest("button")) return;

      onOpen(film.id);
    }}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen(film.id);
      }
    }}
  >
    <FilmCard filmData={film} v="v2" tagsAsText />

    {canManage && (
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          type="button"
          aria-label={`Editar o filme ${film.title}`}
          disabled={disabled}
          onClick={() => onEdit(film.id)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-rede-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rede-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
        >
          <Edit2 width={12} height={12} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label={`Remover o filme ${film.title}`}
          disabled={disabled}
          onClick={() => onRemove(film.id)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-rede-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rede-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
        >
          <Trash2 width={12} height={12} aria-hidden="true" />
        </button>
      </div>
    )}
  </div>
);

type AddFilmTileProps = {
  onAdd: () => void;
  disabled?: boolean;
};

const AddFilmTile: React.FC<AddFilmTileProps> = ({ onAdd, disabled }) => (
  <div className="flex min-h-[280px] w-full items-center justify-center rounded-lg border border-dashed border-rede-white/30 px-4 sm:min-h-[380px]">
    <Button
      variant="secondary"
      className="border border-dashed"
      iconPosition="left"
      icon={<Plus width={12} height={12} aria-hidden="true" />}
      iconButtonClassName="border border-dashed"
      disabled={disabled}
      onClick={onAdd}
    >
      Adicionar filme externo
    </Button>
  </div>
);

type OutsideAgencyProps = {
  isAuthenticated?: boolean;
  films?: ProfileFilm[];
  /** Entradas de festivais, premios e exibicoes, para o detalhe de cada filme. */
  achievements?: ProfileAchievement[];
  accountType?: AccountType;
  isSaving?: boolean;
  onSaveFilms?: (
    films: ProfileFilm[],
  ) => Promise<boolean> | boolean;
};

/**
 * Sem passo "Editar": "Adicionar filme externo" (ou o lapis de um filme) abre o
 * formulario, e o seu "Guardar filme" grava logo no perfil. Remover pede
 * confirmacao e grava tambem.
 */
export const OutsideAgency: React.FC<OutsideAgencyProps> = ({
  isAuthenticated = false,
  films,
  achievements,
  accountType,
  isSaving = false,
  onSaveFilms,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilmId, setEditingFilmId] = useState<string | null>(
    null,
  );
  const [formSession, setFormSession] = useState(0);
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(null);

  const data = useMemo(() => films ?? [], [films]);

  const editingFilm = editingFilmId
    ? data.find((film) => film.id === editingFilmId)
    : undefined;

  const initialFormData = useMemo<
    Partial<FilmFormData> | undefined
  >(() => {
    if (!editingFilm) {
      return undefined;
    }

    return {
      id: editingFilm.id,
      title: editingFilm.title,
      year: String(editingFilm.year),
      duration: editingFilm.duration ?? "",
      countries: editingFilm.countries ?? [],
      theme: editingFilm.type[1] ?? "",
      genre: editingFilm.type[0] ?? "",
      link: editingFilm.link ?? "",
      roles: editingFilm.roles ?? [],
      cover: editingFilm.cover,
    };
  }, [editingFilm]);

  // O AddFilmModal mostra a mensagem se isto lancar, e mantem-se aberto.
  const handleFormSubmit = async (formData: FilmFormData) => {
    const currentFilm = formData.id
      ? data.find((film) => film.id === formData.id)
      : undefined;

    const submittedFilm: ProfileFilm = {
      id: formData.id ?? crypto.randomUUID(),
      title: formData.title.trim(),
      director: currentFilm?.director ?? "",
      type: [formData.genre, formData.theme].filter(Boolean),
      year: Number(formData.year) || new Date().getFullYear(),
      countries: formData.countries,
      cover: formData.cover || FILM_PLACEHOLDER_COVER,
      duration: formData.duration,
      link: formData.link,
      roles: formData.roles.length ? formData.roles : undefined,
    };

    const nextFilms = formData.id
      ? data.map((film) =>
        film.id === formData.id ? submittedFilm : film,
      )
      : [...data, submittedFilm];

    const saved = await onSaveFilms?.(nextFilms);

    if (!saved) {
      throw new Error("Não foi possível guardar o filme. Tente novamente.");
    }

    setEditingFilmId(null);
    setIsFormOpen(false);
  };

  const removeFilm = async (id: string) => {
    const film = data.find((item) => item.id === id);

    if (isSaving || !film) return;
    if (!window.confirm(`Remover "${film.title}" dos filmes fora da agência?`)) return;

    await onSaveFilms?.(data.filter((item) => item.id !== id));
  };

  const addFilm = () => {
    setEditingFilmId(null);
    setFormSession((currentSession) => currentSession + 1);
    setIsFormOpen(true);
  };

  const handleEditFilm = (id: string) => {
    setEditingFilmId(id);
    setFormSession((currentSession) => currentSession + 1);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isSaving) return;

    setEditingFilmId(null);
    setIsFormOpen(false);
  };

  return (
    <section className="h-auto w-full bg-rede-bg">
      <div className="relative mx-auto flex h-auto min-h-90 w-full max-w-[1920px] items-center justify-center">
        <div className="h-auto w-full max-w-360 px-4 py-14 sm:px-6 sm:py-16 lg:px-0 lg:pb-20 lg:pt-20">
          <div className="mb-6 flex flex-col gap-4 border-b border-rede-white/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Heading className={`${customBlur.className} text-[48px] leading-12`}>
                Fora da agência
              </Heading>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.length > 0
              ? data.map((film) => (
                <FilmCardLocal
                  key={film.id}
                  film={film}
                  canManage={isAuthenticated}
                  disabled={isSaving}
                  onEdit={handleEditFilm}
                  onRemove={(id) => void removeFilm(id)}
                  onOpen={setSelectedFilmId}
                />
              ))
              : !isAuthenticated && (
                <Text className="text-[14px] leading-relaxed font-medium">
                  Ainda não existem filmes fora da agência.
                </Text>
              )}

            {isAuthenticated && <AddFilmTile onAdd={addFilm} disabled={isSaving} />}
          </div>
        </div>
      </div>

      <FilmDetailsModal
        film={data.find((film) => film.id === selectedFilmId) ?? null}
        achievements={achievements}
        onClose={() => setSelectedFilmId(null)}
      />

      <AddFilmModal
        key={formSession}
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={initialFormData}
        defaultCover={FILM_PLACEHOLDER_COVER}
        accountType={accountType}
      />
    </section>
  );
};
