"use client";

import { ensureHttps } from "@/actions";
import { useMemo, useState } from "react";
import { Modal } from "./ui/modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { InputSelect } from "./ui/input-select";
import { ImageCropUploader } from "./ImageCropUploader";
import { countriesList } from "./network/filters";
import {
  filmGenreOptions,
  filmThemeOptions,
  getCategoriesByAccountType,
  getFilmTagLabel,
} from "./network/data";
import { AccountType } from "@/types/User";
import { Tag } from "./ui/tag";
import { X } from "lucide-react";

export type FilmFormData = {
  id?: string;
  title: string;
  year: string;
  duration: string;
  countries: string[];
  theme: string;
  genre: string;
  roles: string[];
  link: string;
  cover: string;
};

const EMPTY_FORM: FilmFormData = {
  title: "",
  year: "",
  duration: "",
  countries: [],
  theme: "",
  genre: "",
  roles: [],
  link: "",
  cover: "",
};

// Mais do que tres funcoes deixam o cartao do filme ilegivel, por isso o
// limite vive aqui e e aplicado tanto ao adicionar como ao normalizar.
const MAX_ROLES = 3;

const requiredFields: Array<Exclude<keyof FilmFormData, "countries" | "roles">> = [
  "title",
  "year",
  "duration",
  "theme",
  "genre",
];

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

// Dropdowns com pesquisa: o texto escrito filtra as opcoes, mas so uma opcao
// da lista pode ser escolhida.
const searchableSelectProps = {
  variant: "secondary" as const,
  allowFreeText: false,
  emptyMessage: "Nenhum resultado",
  popoverClassName: "[&>ul]:max-h-[250px]",
};

const normalizeFormData = (form: FilmFormData): FilmFormData => ({
  ...form,
  title: form.title.trim(),
  year: form.year.trim(),
  duration: form.duration.trim(),
  countries: uniqueValues(form.countries),
  theme: form.theme.trim(),
  genre: form.genre.trim(),
  roles: uniqueValues(form.roles).slice(0, MAX_ROLES),
  link: form.link.trim() ? ensureHttps(form.link) : "",
});

type FilmFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FilmFormData) => void | Promise<void>;
  initialData?: Partial<FilmFormData>;
  defaultCover?: string;
  accountType?: AccountType;
};

export const AddFilmModal: React.FC<FilmFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  defaultCover,
  accountType,
}) => {
  const [form, setForm] = useState<FilmFormData>({ ...EMPTY_FORM, ...initialData });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Os campos de "adicionar a lista" limpam o texto pesquisado depois de cada escolha.
  const [countryPickerKey, setCountryPickerKey] = useState(0);
  const [rolePickerKey, setRolePickerKey] = useState(0);

  const availableCountryOptions = useMemo(
    () => countriesList.filter((option) => !form.countries.includes(option.value)),
    [form.countries],
  );

  const addCountry = (country: string) => {
    if (country) {
      setForm((prev) =>
        prev.countries.includes(country) ? prev : { ...prev, countries: [...prev.countries, country] },
      );
    }

    setCountryPickerKey((key) => key + 1);
  };

  const removeCountry = (country: string) =>
    setForm((prev) => ({
      ...prev,
      countries: prev.countries.filter((item) => item !== country),
    }));

  // A funcao segue as mesmas categorias das competencias: empresa usa as
  // categorias de empresa, individual as de profissionais. Uma pessoa pode
  // desempenhar varias funcoes no mesmo filme, por isso a lista ja escolhida
  // sai das opcoes disponiveis.
  const roleOptions = getCategoriesByAccountType(accountType);
  const availableRoleOptions = useMemo(
    () => roleOptions.filter((option) => !form.roles.includes(option.value)),
    [roleOptions, form.roles],
  );

  const addRole = (role: string) => {
    if (role) {
      setForm((prev) =>
        prev.roles.includes(role) || prev.roles.length >= MAX_ROLES
          ? prev
          : { ...prev, roles: [...prev.roles, role] },
      );
    }

    setRolePickerKey((key) => key + 1);
  };

  const removeRole = (role: string) =>
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.filter((item) => item !== role),
    }));

  const update = <K extends keyof FilmFormData>(key: K, value: FilmFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError("");
    const payload = normalizeFormData({
      ...form,
      cover: form.cover || defaultCover || "",
    });

    if (requiredFields.some((field) => !payload[field]) || payload.countries.length === 0) {
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
    <Modal open={open} onClose={onClose} panelClassName="w-full max-w-[680px] rounded-none border-[1.3px] border-white/90">
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
            <Text className="text-[16px] font-medium">Título</Text>
            <Input
              variant="secondary"
              placeholder="Ex: Terra Vermelha"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="w-1/2 flex gap-2">
            <div className="flex flex-col gap-2">
              <Text className="text-[16px] font-medium">Ano</Text>
              <Input
                variant="secondary"
                placeholder="2026"
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Text className="text-[16px] font-medium">Duração</Text>
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
          <Text className="text-[16px] font-medium">Países</Text>

          {form.countries.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {form.countries.map((country) => (
                <Tag key={country} className="flex gap-1 items-center">
                  {getFilmTagLabel(country)}
                  <X
                    width={12}
                    height={12}
                    color="#ffffff"
                    className="cursor-pointer"
                    aria-label={`Remover ${getFilmTagLabel(country)}`}
                    onClick={() => removeCountry(country)}
                  />
                </Tag>
              ))}
            </div>
          )}

          <InputSelect
            key={countryPickerKey}
            {...searchableSelectProps}
            placeholder={form.countries.length > 0 ? "Adicionar outro país" : "Pesquisar e adicionar país"}
            options={availableCountryOptions}
            value=""
            onChange={addCountry}
          />
        </div>

        <div className="flex justify-between gap-2">
          <div className="w-full flex flex-col gap-2">
            <Text className="text-[16px] font-medium">Tema</Text>
            <InputSelect
              {...searchableSelectProps}
              placeholder="Pesquisar tema"
              options={filmThemeOptions}
              value={form.theme}
              onChange={(value) => update("theme", value)}
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <Text className="text-[16px] font-medium">Gênero</Text>
            <InputSelect
              {...searchableSelectProps}
              placeholder="Pesquisar gênero"
              options={filmGenreOptions}
              value={form.genre}
              onChange={(value) => update("genre", value)}
            />
          </div>
        </div>


        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5">
            <Text className="text-[16px] font-medium">Função</Text>
            <span className="text-xs text-rede-white/40">(até {MAX_ROLES})</span>
          </div>

          {form.roles.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {form.roles.map((role) => (
                <Tag key={role} className="flex gap-1 items-center">
                  {getFilmTagLabel(role)}
                  <X
                    width={12}
                    height={12}
                    color="#ffffff"
                    className="cursor-pointer"
                    onClick={() => removeRole(role)}
                  />
                </Tag>
              ))}
            </div>
          )}


          <InputSelect
            key={rolePickerKey}
            {...searchableSelectProps}
            placeholder={form.roles.length >= MAX_ROLES ? "Limite de funções atingido" : "Pesquisar e adicionar função"}
            value=""
            options={availableRoleOptions}
            disabled={form.roles.length >= MAX_ROLES}
            onChange={addRole}
          />
        </div>


        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5">
            <Text className="text-[16px] font-medium">Link do filme</Text>
            <span className="text-xs text-rede-white/40">(opcional)</span>
          </div>
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
