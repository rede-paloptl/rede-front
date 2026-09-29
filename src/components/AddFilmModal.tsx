"use client";

import { ensureHttps } from "@/actions";
import { useMemo, useState } from "react";
import { Modal } from "./ui/modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { InputSelect } from "./ui/input-select";
import { InputSelectMultiple } from "./ui/input-select-multiple";
import { ImageCropUploader } from "./ImageCropUploader";
import { getTaxonomy } from "@/lib/taxonomy";
import {
  filmTypeKinds,
  getFilmFormatOptions,
  getFilmGenreOptions,
  getFilmTagLabel,
  getFilmThemeOptions,
  getProfileCategories,
  ProfileTypeSource,
} from "./network/data";
import { ProfileFilm } from "@/types/User";
import { Tag } from "./ui/tag";
import { X } from "lucide-react";

export type FilmFormData = {
  id?: string;
  title: string;
  year: string;
  duration: string;
  countries: string[];
  format: string;
  genre: string;
  themes: string[];
  roles: string[];
  link: string;
  cover: string;
};

const EMPTY_FORM: FilmFormData = {
  title: "",
  year: "",
  duration: "",
  countries: [],
  format: "",
  genre: "",
  themes: [],
  roles: [],
  link: "",
  cover: "",
};

// Mais do que tres funcoes deixam o cartao do filme ilegivel, por isso o
// limite vive aqui e e aplicado tanto ao adicionar como ao normalizar.
const MAX_ROLES = 3;

// Paises fora da lista (a lista so tem os PALOP+TL). Os filmes aceitam valores
// fora das listas, que ficam gravados e aparecem tal e qual.
const OTHER_COUNTRY = { label: "Outros", value: "Outros" };

type RequiredField = Extract<keyof FilmFormData, "title" | "year" | "duration" | "format" | "genre">;

// O formato so e exigido quando a lista existe: ate a API criar a lista
// (migracao no arranque), ninguem fica impedido de gravar.
const getRequiredFields = (): RequiredField[] => [
  "title",
  "year",
  "duration",
  "genre",
  ...(getFilmFormatOptions().length > 0 ? (["format"] as const) : []),
];

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

// Dropdowns com pesquisa: o texto escrito filtra as opcoes, mas so uma opcao
// da lista pode ser escolhida.
const searchableSelectProps = {
  variant: "secondary" as const,
  emptyMessage: "Nenhum resultado",
  popoverClassName: "[&>ul]:max-h-[250px]",
};

/**
 * `type` de um filme junta formato, genero e temas numa so lista; cada valor
 * e separado pelo tipo do termo. Um valor fora das listas fica nos temas, onde
 * continua visivel e pode ser removido.
 */
const splitFilmType = (type: string[] = []): Pick<FilmFormData, "format" | "genre" | "themes"> => {
  const taxonomy = getTaxonomy();
  const split: Pick<FilmFormData, "format" | "genre" | "themes"> = { format: "", genre: "", themes: [] };

  for (const value of type) {
    const term = taxonomy.find(value, filmTypeKinds);

    if (term?.kind === "film-format") split.format ||= term.id;
    else if (term?.kind === "film-genre") split.genre ||= term.id;
    else split.themes.push(term?.id ?? value);
  }

  return split;
};

/** Os dados de um filme gravado, prontos para o formulario. */
export const toFilmFormData = (film: ProfileFilm): FilmFormData => ({
  id: film.id,
  title: film.title,
  year: String(film.year),
  duration: film.duration ?? "",
  countries: film.countries ?? [],
  ...splitFilmType(film.type),
  link: film.link ?? "",
  roles: film.roles ?? [],
  cover: film.cover,
});

/** O filme a gravar no perfil a partir do formulario (ja validado). */
export const toProfileFilm = (form: FilmFormData, current?: ProfileFilm): ProfileFilm => ({
  id: form.id ?? crypto.randomUUID(),
  title: form.title.trim(),
  director: current?.director ?? "",
  type: uniqueValues([form.format, form.genre, ...form.themes]),
  year: Number(form.year) || new Date().getFullYear(),
  countries: form.countries,
  cover: form.cover,
  duration: form.duration,
  link: form.link,
  roles: form.roles.length ? form.roles : undefined,
});

const toFormIds = (form: FilmFormData): FilmFormData => {
  const taxonomy = getTaxonomy();

  return {
    ...form,
    countries: form.countries.map((country) => taxonomy.id(country, ["country"])),
    format: form.format ? taxonomy.id(form.format, ["film-format"]) : "",
    genre: form.genre ? taxonomy.id(form.genre, ["film-genre"]) : "",
    themes: form.themes.map((theme) => taxonomy.id(theme, ["film-theme"])),
    roles: form.roles.map((role) => taxonomy.id(role, ["profile-category", "profile-subcategory"])),
  };
};

const normalizeFormData = (form: FilmFormData): FilmFormData => ({
  ...form,
  title: form.title.trim(),
  year: form.year.trim(),
  duration: form.duration.trim(),
  countries: uniqueValues(form.countries),
  format: form.format.trim(),
  genre: form.genre.trim(),
  themes: uniqueValues(form.themes),
  roles: uniqueValues(form.roles).slice(0, MAX_ROLES),
  link: form.link.trim() ? ensureHttps(form.link) : "",
});

type SelectedTagsProps = {
  values: string[];
  onRemove: (value: string) => void;
};

const SelectedTags: React.FC<SelectedTagsProps> = ({ values, onRemove }) =>
  values.length > 0 ? (
    <div className="flex flex-wrap gap-2.5">
      {values.map((value) => (
        <Tag key={value} className="flex gap-1 items-center">
          {getFilmTagLabel(value)}
          <button
            type="button"
            aria-label={`Remover ${getFilmTagLabel(value)}`}
            onClick={() => onRemove(value)}
            className="inline-flex cursor-pointer"
          >
            <X width={12} height={12} color="#ffffff" />
          </button>
        </Tag>
      ))}
    </div>
  ) : null;

type FieldLabelProps = {
  children: React.ReactNode;
  hint?: string;
};

const FieldLabel: React.FC<FieldLabelProps> = ({ children, hint }) => (
  <div className="flex items-baseline gap-1.5">
    <Text className="text-[16px] font-medium">{children}</Text>
    {hint && <span className="text-xs text-rede-white/40">{hint}</span>}
  </div>
);

type FilmFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FilmFormData) => void | Promise<void>;
  initialData?: Partial<FilmFormData>;
  defaultCover?: string;
  /** Tipo do perfil: as funcoes saem das categorias desse tipo. */
  profile?: ProfileTypeSource;
};

export const AddFilmModal: React.FC<FilmFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  defaultCover,
  profile,
}) => {
  // Filmes antigos podem ter slugs em vez de ids: o formulario usa sempre ids.
  const [form, setForm] = useState<FilmFormData>(() => toFormIds({ ...EMPTY_FORM, ...initialData }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const countryOptions = useMemo(() => [...getTaxonomy().countriesList, OTHER_COUNTRY], []);

  // A funcao segue as mesmas categorias das competencias do perfil. Uma pessoa
  // pode desempenhar varias funcoes no mesmo filme.
  const roleOptions = getProfileCategories(profile);

  const update = <K extends keyof FilmFormData>(key: K, value: FilmFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const removeFrom = (key: "countries" | "themes" | "roles", value: string) =>
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((item) => item !== value) }));

  const handleSubmit = async () => {
    setError("");
    const payload = normalizeFormData({
      ...form,
      cover: form.cover || defaultCover || "",
    });

    if (
      getRequiredFields().some((field) => !payload[field]) ||
      payload.countries.length === 0 ||
      payload.themes.length === 0
    ) {
      setError("Preencha todos os campos obrigatórios do filme.");
      return;
    }

    if (!payload.cover || payload.cover.startsWith("blob:")) {
      setError("Aplique a imagem antes de guardar o filme.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar o filme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnBackdropClick={false}
      panelClassName="w-full max-w-[680px] rounded-none border-[1.3px] border-white/90"
    >
      <div className="flex flex-col gap-6">
        <ImageCropUploader
          height={250}
          value={form.cover}
          purpose="film"
          aspectRatio={300 / 220}
          minHeight={252}
          helperText={"Mantenha o conteúdo principal dentro da área vazia. As faixas laterais podem ser cortadas consoante o formato do cartão."}
          uploadLabel="Aplicar imagem"
          onUploaded={(url) => update("cover", url)}
          onError={setError}
        />

        <div className="w-full flex gap-3">
          <div className="w-1/2 flex flex-col gap-2">
            <FieldLabel>Título</FieldLabel>
            <Input
              variant="secondary"
              placeholder="Ex: Terra Vermelha"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="w-1/2 flex gap-2">
            <div className="flex flex-col gap-2">
              <FieldLabel>Ano</FieldLabel>
              <Input
                variant="secondary"
                placeholder="2026"
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Duração</FieldLabel>
              <Input
                variant="secondary"
                placeholder="14 min"
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Países</FieldLabel>
          <SelectedTags values={form.countries} onRemove={(country) => removeFrom("countries", country)} />
          <InputSelectMultiple
            {...searchableSelectProps}
            placeholder="Pesquisar e adicionar país"
            options={countryOptions}
            value={form.countries}
            onChange={(countries) => update("countries", countries)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Tema</FieldLabel>
          <SelectedTags values={form.themes} onRemove={(theme) => removeFrom("themes", theme)} />
          <InputSelectMultiple
            {...searchableSelectProps}
            placeholder="Pesquisar e adicionar tema"
            options={getFilmThemeOptions()}
            value={form.themes}
            onChange={(themes) => update("themes", themes)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <div className="flex flex-col gap-2">
            <FieldLabel>Formato</FieldLabel>
            <InputSelect
              {...searchableSelectProps}
              allowFreeText={false}
              placeholder="Pesquisar formato"
              options={getFilmFormatOptions()}
              value={form.format}
              onChange={(value) => update("format", value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Gênero</FieldLabel>
            <InputSelect
              {...searchableSelectProps}
              allowFreeText={false}
              placeholder="Pesquisar gênero"
              options={getFilmGenreOptions()}
              value={form.genre}
              onChange={(value) => update("genre", value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel hint={`(até ${MAX_ROLES})`}>Função</FieldLabel>
          <SelectedTags values={form.roles} onRemove={(role) => removeFrom("roles", role)} />
          <InputSelectMultiple
            {...searchableSelectProps}
            placeholder="Pesquisar e adicionar função"
            options={roleOptions}
            value={form.roles}
            max={MAX_ROLES}
            onChange={(roles) => update("roles", roles)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel hint="(opcional)">Link do filme</FieldLabel>
          <Input
            variant="secondary"
            placeholder="Link..."
            value={form.link}
            onChange={(e) => update("link", e.target.value)}
            icon={<span className="text-sm">https://</span>}
            iconContainerClassName="w-18 rounded-[8px]"
            iconPosition="left"
          />
        </div>

        {error && <Text className="text-[14px] leading-5 text-rede-red">{error}</Text>}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? "A guardar..." : "Guardar filme"}</Button>
        </div>
      </div>
    </Modal>
  );
};
