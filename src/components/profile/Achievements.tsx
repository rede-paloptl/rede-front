"use client";

import { useState } from "react";
import { Edit2, Plus, Trash } from "lucide-react";
import { customBlur } from "@/app/fonts";
import { ProfileAchievement, ProfileFilm } from "@/types/User";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/select";

type EntryType = "Festival" | "Categoria" | "Premio" | "Exibicao";

export type AchievementEntry = ProfileAchievement & {
  type: EntryType | string;
};

const entryTypeOptions = [
  { label: "Categorias", value: "Categoria" },
  { label: "Exibições", value: "Exibicao" },
  { label: "Festivais", value: "Festival" },
  { label: "Prémios", value: "Premio" }
];

const createEmptyEntry = (): AchievementEntry => ({
  id: crypto.randomUUID(),
  type: "Festival",
  title: "",
  link: "",
});

type EntryTypePillProps = {
  entry: AchievementEntry;
  onChange: (patch: Partial<AchievementEntry>) => void;
};

const EntryTypePill: React.FC<EntryTypePillProps> = ({
  entry,
  onChange,
}) => (
  <div className="relative w-full shrink-0">
    <Select
      variant="secondary"
      options={entryTypeOptions}
      value={entry.type}
      onChange={(value) => onChange({ type: value })}
    />
  </div>
);

type EntryFormProps = {
  entry: AchievementEntry;
  films: ProfileFilm[];
  isNew: boolean;
  isSaving: boolean;
  error: string;
  onChange: (patch: Partial<AchievementEntry>) => void;
  onSave: () => void;
  onCancel: () => void;
};

// Uma entrada de cada vez, com um unico "Guardar" que grava logo no perfil.
const EntryForm: React.FC<EntryFormProps> = ({
  entry,
  films,
  isNew,
  isSaving,
  error,
  onChange,
  onSave,
  onCancel,
}) => (
  <form
    noValidate
    onSubmit={(event) => {
      event.preventDefault();
      onSave();
    }}
    className="flex flex-col gap-4 rounded-lg border border-rede-white/30 p-4 sm:p-6"
  >
    <Text className="text-[16px] font-semibold leading-6">
      {isNew ? "Nova entrada" : "Editar entrada"}
    </Text>

    <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
      <div className="h-auto w-full sm:w-auto sm:min-w-[260px] sm:max-w-1/2">
        <EntryTypePill entry={entry} onChange={onChange} />
      </div>

      <div className="flex h-auto w-full flex-col gap-4">
        <Input
          variant="secondary"
          placeholder="Título..."
          value={entry.title}
          disabled={isSaving}
          autoFocus
          onChange={(event) => onChange({ title: event.target.value })}
          aria-invalid={Boolean(error)}
        />

        <Input
          variant="secondary"
          type="url"
          inputMode="url"
          placeholder="Link..."
          value={entry.link ?? ""}
          disabled={isSaving}
          onChange={(event) => onChange({ link: event.target.value })}
          icon={<span className="text-sm">https://</span>}
          iconContainerClassName="w-18 rounded-[8px]"
          iconPosition="left"
        />
      </div>
    </div>

    {films.length > 0 && (
      <div className="flex flex-col gap-2">
        <Text className="text-[14px] font-medium leading-5 text-rede-white/70">
          Filme associado <span className="text-xs text-rede-white/40">(opcional)</span>
        </Text>
        <Select
          variant="secondary"
          placeholder="Nenhum filme"
          disabled={isSaving}
          options={[
            { label: "Nenhum filme", value: "" },
            ...films.map((film) => ({ label: film.year ? `${film.title} (${film.year})` : film.title, value: film.id })),
          ]}
          value={entry.filmId ?? ""}
          onChange={(value) => onChange({ filmId: value || undefined })}
        />
      </div>
    )}

    {error && (
      <Text role="alert" className="text-[14px] leading-5 text-rede-red">
        {error}
      </Text>
    )}

    <div className="flex flex-wrap gap-2 sm:gap-1">
      <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-none">
        {isSaving ? "A guardar..." : "Guardar"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        disabled={isSaving}
        className="flex-1 sm:flex-none"
        onClick={onCancel}
      >
        Cancelar
      </Button>
    </div>
  </form>
);

type AddEntryTileProps = {
  onAdd: () => void;
  disabled?: boolean;
};

const AddEntryTile: React.FC<AddEntryTileProps> = ({ onAdd, disabled }) => (
  <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-rede-white/30 px-4 sm:h-36">
    <Button
      variant="secondary"
      className="border border-dashed"
      iconPosition="left"
      icon={<Plus width={12} height={12} aria-hidden="true" />}
      iconButtonClassName="border border-dashed"
      disabled={disabled}
      onClick={onAdd}
    >
      Adicionar entrada
    </Button>
  </div>
);

type AchievementsProps = {
  isAuthenticated?: boolean;
  achievements?: AchievementEntry[];
  /** Filmes do perfil (filmografia e fora da agencia) que uma entrada pode referir. */
  films?: ProfileFilm[];
  isSaving?: boolean;
  onSaveAchievements?: (
    achievements: AchievementEntry[],
  ) => boolean | Promise<boolean>;
};

export const Achievements: React.FC<AchievementsProps> = ({
  isAuthenticated = false,
  achievements,
  films = [],
  isSaving = false,
  onSaveAchievements,
}) => {
  // null: nenhum formulario aberto. Sem "Editar" geral: cada entrada abre o seu.
  const [formEntry, setFormEntry] = useState<AchievementEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [formError, setFormError] = useState("");

  const data = achievements ?? [];

  const openNewEntry = () => {
    setFormEntry(createEmptyEntry());
    setIsNewEntry(true);
    setFormError("");
  };

  const openEditEntry = (entry: AchievementEntry) => {
    setFormEntry({ ...entry });
    setIsNewEntry(false);
    setFormError("");
  };

  const closeForm = () => {
    setFormEntry(null);
    setFormError("");
  };

  const updateFormEntry = (patch: Partial<AchievementEntry>) => {
    setFormEntry((current) => (current ? { ...current, ...patch } : current));
    setFormError("");
  };

  const handleSaveEntry = async () => {
    if (!formEntry) return;

    // Um filme que entretanto foi removido deixa de contar como associado.
    const filmId = films.some((film) => film.id === formEntry.filmId) ? formEntry.filmId : undefined;

    const entry = {
      ...formEntry,
      title: formEntry.title.trim(),
      link: formEntry.link?.trim() ?? "",
      filmId,
    };

    if (!entry.title) {
      setFormError("Indique o título.");
      return;
    }

    const nextAchievements = isNewEntry
      ? [...data, entry]
      : data.map((item) => (item.id === entry.id ? entry : item));

    const saved = await onSaveAchievements?.(nextAchievements);

    if (saved) {
      closeForm();
      return;
    }

    setFormError("Não foi possível guardar a entrada. Tente novamente.");
  };

  const handleRemoveEntry = async (entry: AchievementEntry) => {
    if (isSaving) return;
    if (!window.confirm(`Remover "${entry.title}"?`)) return;

    await onSaveAchievements?.(data.filter((item) => item.id !== entry.id));

    if (formEntry?.id === entry.id) closeForm();
  };

  return (
    <section className="h-auto w-full">
      <div className="relative mx-auto flex h-auto min-h-90 w-full max-w-[1920px] items-center justify-center">
        <div className="mb-20 h-auto w-full max-w-360 px-4 sm:px-6 lg:mb-40 lg:px-0">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Heading
              className={`${customBlur.className} min-w-0 flex-1 text-[34px] leading-[38px] sm:text-[40px] sm:leading-11 lg:flex-none lg:text-[48px] lg:leading-12`}
            >
              Festivais, Prémios e Exibições
            </Heading>
          </div>

          <div className="flex gap-5">
            <div className="w-full bg-transparent text-rede-white">
              {data.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 sm:gap-y-0">
                  {data.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 border-b border-rede-white pb-4"
                    >
                      <div className="min-w-0">
                        <span className="text-xs leading-4 text-rede-white">
                          {item.type}
                        </span>

                        <Text className="mt-1 break-words text-[18px] font-semibold leading-6 sm:text-[20px] sm:leading-7">
                          {item.title}
                        </Text>

                        {item.filmId && films.find((film) => film.id === item.filmId) && (
                          <Text className="mt-1 text-[12px] font-medium leading-4 text-rede-white/70">
                            Filme: {films.find((film) => film.id === item.filmId)?.title}
                          </Text>
                        )}
                      </div>

                      {isAuthenticated && (
                        <div className="flex shrink-0 gap-2 pt-1">
                          <Button
                            variant="secondary"
                            aria-label={`Editar ${item.title}`}
                            disabled={isSaving}
                            className="flex aspect-square h-10 w-10 items-center justify-center rounded-full p-0"
                            onClick={() => openEditEntry(item)}
                          >
                            <Edit2 width={12} height={12} aria-hidden="true" />
                          </Button>

                          <Button
                            variant="secondary"
                            aria-label={`Remover ${item.title}`}
                            disabled={isSaving}
                            className="flex aspect-square h-10 w-10 items-center justify-center rounded-full p-0"
                            onClick={() => void handleRemoveEntry(item)}
                          >
                            <Trash width={12} height={12} aria-hidden="true" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="text-[14px] leading-relaxed font-medium">
                  Ainda não existem festivais, prémios ou exibições.
                </Text>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
              {formEntry ? (
                <EntryForm
                  entry={formEntry}
                  films={films}
                  isNew={isNewEntry}
                  isSaving={isSaving}
                  error={formError}
                  onChange={updateFormEntry}
                  onSave={() => void handleSaveEntry()}
                  onCancel={closeForm}
                />
              ) : (
                <AddEntryTile onAdd={openNewEntry} disabled={isSaving} />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
