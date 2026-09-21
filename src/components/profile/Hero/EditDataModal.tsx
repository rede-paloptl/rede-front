"use client"

import { ReactNode, useMemo, useState } from "react"
import { X } from "lucide-react"
import { User } from "@/types/User"
import { SocialNetwork } from "@/types/Profile"
import { customBlur } from "@/app/fonts"
import { countries, services, socialFields } from "@/components/Auth/data"
import { getCoreSkillOptions, getSkillOptions } from "../Bio/SectionEditSkills"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import { SelectMultiple } from "@/components/ui/select-multiple"
import { Tag } from "@/components/ui/tag"
import { Text } from "@/components/ui/text"
import { Textarea } from "@/components/ui/textarea"

type ProfileData = User["profileData"];

type EditDataModalProps = {
  open: boolean;
  profile?: User;
  profileData: ProfileData;
  isSaving?: boolean;
  onClose: () => void;
  onSave?: (patch: Partial<ProfileData>, userPatch: Pick<User, "name">) => Promise<boolean>;
};

type FormValues = {
  name: string;
  artisticName: string;
  birthDate: string;
  isAssociated: boolean;
  companyName: string;
  commercialName: string;
  creationDate: string;
  isRegistered: boolean;
  services: string[];
  otherService: string;
  rentsEquipment: boolean;
  equipmentName: string;
  country: string;
  city: string;
  professionalEmail: string;
  professionalPhone: string;
  profession: string;
  coreSkills: string[];
  skills: string[];
  bio: string;
  socialLinks: Record<SocialNetwork, string>;
  isVisible: boolean;
};

type FormErrors = Partial<Record<string, string>>;

const BIO_MAX_LENGTH = 1300;
const CORE_SKILLS_LIMIT = 3;

// Mesmo mapeamento do registo (OnBoarding): o select usa o slug, a API guarda
// o nome sem acentos.
const apiCountryByFormValue: Record<string, string> = {
  angola: "Angola",
  "cabo-verde": "Cabo Verde",
  "guine-bissau": "Guine-Bissau",
  mocambique: "Mocambique",
  "sao-tome-principe": "Sao Tome e Principe",
  "timor-leste": "Timor-Leste",
};

const formCountryByApiValue = Object.fromEntries(
  Object.entries(apiCountryByFormValue).map(([formValue, apiValue]) => [apiValue, formValue]),
);

const countryOptions = countries
  .filter((country) => country.value in apiCountryByFormValue)
  .map(({ label, value }) => ({ label, value }));

const yesNoOptions = [
  { label: "Não", value: "no" },
  { label: "Sim", value: "yes" },
];

const selectClassNames = {
  triggerClassName: "border-[1.3px] border-white px-3 text-rede-white outline-none",
  popoverClassName: "rounded-[8px] border-[1.3px] border-white px-3 text-rede-white outline-none mt-[10px]",
  satelliteClassName: "border-[1.3px] border-white",
};

const toDateField = (value?: string) => (value ? String(value).slice(0, 10) : "");

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// "@nome" vira o perfil da rede; um dominio solto ganha o https://.
const socialDomains: Record<SocialNetwork, string> = {
  website: "",
  facebook: "facebook.com",
  instagram: "instagram.com",
  linkedin: "linkedin.com/in",
  youtube: "youtube.com",
  tiktok: "tiktok.com",
  imdb: "imdb.com/name",
};

const toSocialUrl = (network: SocialNetwork, value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith("@") && socialDomains[network]) {
    const handle = network === "tiktok" || network === "youtube" ? trimmed : trimmed.slice(1);
    return `https://${socialDomains[network]}/${handle}`;
  }

  return `https://${trimmed}`;
};

const buildValues = (profile: User | undefined, profileData: ProfileData): FormValues => ({
  name: profile?.name ?? "",
  artisticName: profileData.artisticName ?? "",
  birthDate: toDateField(profileData.birthDate),
  isAssociated: Boolean(profileData.associatedWithCompany?.status),
  companyName: profileData.associatedWithCompany?.companyName ?? "",
  commercialName: profileData.commercialName ?? "",
  creationDate: toDateField(profileData.creationDate),
  isRegistered: Boolean(profileData.isRegistered),
  services: Array.isArray(profileData.services) ? profileData.services : [],
  otherService: profileData.otherService ?? "",
  rentsEquipment: Boolean(profileData.rentsEquipment?.status),
  equipmentName: profileData.rentsEquipment?.equipmentName ?? "",
  country: formCountryByApiValue[profileData.country] ?? profileData.country ?? "",
  city: profileData.city ?? "",
  professionalEmail: profileData.professionalEmail ?? "",
  professionalPhone: profileData.professionalPhone ?? "",
  profession: profileData.profession ?? "",
  coreSkills: (profileData.coreSkills ?? []).slice(0, CORE_SKILLS_LIMIT),
  skills: profileData.skills ?? [],
  bio: profileData.bio ?? "",
  socialLinks: socialFields.reduce(
    (links, field) => ({ ...links, [field.key]: profileData.socialLinks?.[field.key] ?? "" }),
    {} as Record<SocialNetwork, string>,
  ),
  isVisible: profileData.isVisible !== false,
});

const validate = (values: FormValues, isIndividual: boolean): FormErrors => {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) errors.name = "O nome deve ter pelo menos 2 caracteres.";
  if (!apiCountryByFormValue[values.country]) errors.country = "Selecione um país válido.";

  if (isIndividual) {
    if (!values.artisticName.trim()) errors.artisticName = "Informe o nome artístico.";
    if (!values.birthDate) errors.birthDate = "Informe a data de nascimento.";
    if (values.isAssociated && !values.companyName.trim()) errors.companyName = "Indique o nome da empresa ou colectivo.";
  }

  if (values.professionalEmail.trim() && !isValidEmail(values.professionalEmail.trim())) {
    errors.professionalEmail = "Indique um email válido.";
  }

  for (const field of socialFields) {
    const value = values.socialLinks[field.key];

    if (value.trim() && !isValidUrl(toSocialUrl(field.key, value))) {
      errors[field.key] = `Indique um endereço válido para ${field.label}.`;
    }
  }

  return errors;
};

const Field = ({ label, error, children, className = "" }: { label: string; error?: string; children: ReactNode; className?: string }) => (
  <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
    <Text as="span" className="text-[14px] leading-5 font-medium text-rede-white/70">{label}</Text>
    {children}
    {error && <Text className="text-[12px] leading-4 text-rede-red">{error}</Text>}
  </div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text className="mt-2 border-t-[1.3px] border-rede-white/20 pt-6 text-[16px] leading-6 font-bold text-rede-white">
    {children}
  </Text>
);

// Montado so quando abre: cada abertura parte dos dados gravados.
export const EditDataModal: React.FC<EditDataModalProps> = (props) => {
  if (!props.open) return null;

  return <EditDataForm {...props} />;
};

const EditDataForm: React.FC<EditDataModalProps> = ({ profile, profileData, isSaving = false, onClose, onSave }) => {
  const isIndividual = profileData.accountType !== "company";
  const [values, setValues] = useState<FormValues>(() => buildValues(profile, profileData));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const cityOptions = useMemo(() => {
    const cities = countries.find((item) => item.value === values.country)?.cities ?? [];
    const options = cities.map((city) => ({ label: city, value: city }));

    return values.city && !cities.includes(values.city) ? [{ label: values.city, value: values.city }, ...options] : options;
  }, [values.country, values.city]);

  const coreSkillOptions = getCoreSkillOptions(profileData).filter((option) => !values.coreSkills.includes(option.label));
  const skillOptions = getSkillOptions(profileData).filter((option) => !values.skills.includes(option.label));

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  };

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  const handleSave = async () => {
    const nextErrors = validate(values, isIndividual);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitError("Corrija os campos assinalados antes de guardar.");
      return;
    }

    const coreSkills = values.coreSkills.slice(0, CORE_SKILLS_LIMIT);
    const socialLinks = socialFields.reduce<Partial<Record<SocialNetwork, string>>>((links, field) => {
      const url = toSocialUrl(field.key, values.socialLinks[field.key]);
      if (url) links[field.key] = url;
      return links;
    }, {});

    const patch: Partial<ProfileData> = {
      country: apiCountryByFormValue[values.country],
      city: values.city,
      professionalEmail: values.professionalEmail.trim(),
      professionalPhone: values.professionalPhone.trim(),
      profession: values.profession.trim(),
      coreSkills,
      skills: Array.from(new Set([...values.skills, ...coreSkills])),
      bio: values.bio.slice(0, BIO_MAX_LENGTH),
      socialLinks,
      isVisible: values.isVisible,
      ...(isIndividual
        ? {
          artisticName: values.artisticName.trim(),
          birthDate: values.birthDate,
          associatedWithCompany: { status: values.isAssociated, companyName: values.isAssociated ? values.companyName.trim() : "" },
        }
        : {
          commercialName: values.commercialName.trim(),
          creationDate: values.creationDate,
          isRegistered: values.isRegistered,
          services: values.services,
          otherService: values.otherService.trim(),
          rentsEquipment: { status: values.rentsEquipment, equipmentName: values.rentsEquipment ? values.equipmentName.trim() : "" },
        }),
    };

    const saved = await onSave?.(patch, { name: values.name.trim() });

    if (!saved) setSubmitError("Não foi possível guardar os dados. Tente novamente.");
  };

  const renderTags = (items: string[], onRemove: (item: string) => void) => (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-[8px] border-[1.3px] border-white px-3 py-2">
      {items.length > 0 ? items.map((item) => (
        <Tag key={item} className="flex items-center gap-1 bg-rede-surface">
          {item}
          <X width={12} height={12} color="#ffffff" className="cursor-pointer" onClick={() => !isSaving && onRemove(item)} />
        </Tag>
      )) : (
        <Text className="text-[14px] leading-5 text-rede-white/60">Nenhuma selecionada</Text>
      )}
    </div>
  );

  return (
    <Modal
      open
      onClose={handleClose}
      wrapperClassName="max-w-3xl"
      panelClassName="rounded-none border-[1.3px] border-rede-white/20 p-6 sm:p-8"
    >
      <Heading className={`${customBlur.className} text-[32px] leading-9 font-medium`}>
        Os meus dados
      </Heading>
      <Text className="mt-2 text-[14px] leading-5 text-rede-white/70">
        {isIndividual ? "Perfil individual" : "Perfil de empresa"}
      </Text>

      <div className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome" error={errors.name}>
            <Input variant="secondary" value={values.name} disabled={isSaving} onChange={(e) => set("name", e.target.value)} />
          </Field>

          {isIndividual ? (
            <>
              <Field label="Nome artístico" error={errors.artisticName}>
                <Input variant="secondary" value={values.artisticName} disabled={isSaving} onChange={(e) => set("artisticName", e.target.value)} />
              </Field>
              <Field label="Data de nascimento" error={errors.birthDate}>
                <Input variant="secondary" type="date" value={values.birthDate} disabled={isSaving} onChange={(e) => set("birthDate", e.target.value)} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Nome comercial">
                <Input variant="secondary" value={values.commercialName} disabled={isSaving} onChange={(e) => set("commercialName", e.target.value)} />
              </Field>
              <Field label="Data de criação">
                <Input variant="secondary" type="date" value={values.creationDate} disabled={isSaving} onChange={(e) => set("creationDate", e.target.value)} />
              </Field>
              <Field label="A entidade está registada?">
                <Select variant="secondary" options={yesNoOptions} value={values.isRegistered ? "yes" : "no"} disabled={isSaving} onChange={(value) => set("isRegistered", value === "yes")} {...selectClassNames} />
              </Field>
            </>
          )}

          <Field label="Profissão">
            <Input variant="secondary" value={values.profession} disabled={isSaving} onChange={(e) => set("profession", e.target.value)} />
          </Field>
        </div>

        <SectionTitle>Localização e contacto</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="País" error={errors.country}>
            <Select
              variant="secondary"
              options={countryOptions}
              value={values.country}
              placeholder="Selecione o país"
              disabled={isSaving}
              onChange={(value) => setValues((current) => ({ ...current, country: value, city: "" }))}
              {...selectClassNames}
            />
          </Field>
          <Field label="Cidade">
            <Select
              variant="secondary"
              options={cityOptions}
              value={values.city}
              placeholder={values.country ? "Selecione a cidade" : "Selecione o país primeiro"}
              disabled={isSaving || !values.country}
              onChange={(value) => set("city", value)}
              {...selectClassNames}
            />
          </Field>
          <Field label="Email profissional" error={errors.professionalEmail}>
            <Input variant="secondary" type="email" placeholder="profissional@email.com" value={values.professionalEmail} disabled={isSaving} onChange={(e) => set("professionalEmail", e.target.value)} />
          </Field>
          <Field label="Telefone profissional / WhatsApp">
            <Input variant="secondary" type="tel" placeholder="+670 0000 0000" value={values.professionalPhone} disabled={isSaving} onChange={(e) => set("professionalPhone", e.target.value)} />
          </Field>
        </div>

        {isIndividual ? (
          <>
            <SectionTitle>Associação</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Está associado a alguma empresa ou colectivo?">
                <Select variant="secondary" options={yesNoOptions} value={values.isAssociated ? "yes" : "no"} disabled={isSaving} onChange={(value) => set("isAssociated", value === "yes")} {...selectClassNames} />
              </Field>
              {values.isAssociated && (
                <Field label="Nome da empresa ou colectivo" error={errors.companyName}>
                  <Input variant="secondary" value={values.companyName} disabled={isSaving} onChange={(e) => set("companyName", e.target.value)} />
                </Field>
              )}
            </div>
          </>
        ) : (
          <>
            <SectionTitle>Serviços</SectionTitle>
            <Field label="Serviços fornecidos">
              <SelectMultiple variant="secondary" options={services} value={values.services} placeholder="Selecione todos os serviços" disabled={isSaving} onChange={(value) => set("services", value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Outro serviço">
                <Input variant="secondary" value={values.otherService} disabled={isSaving} onChange={(e) => set("otherService", e.target.value)} />
              </Field>
              <Field label="Fornece aluguer de equipamentos?">
                <Select variant="secondary" options={yesNoOptions} value={values.rentsEquipment ? "yes" : "no"} disabled={isSaving} onChange={(value) => set("rentsEquipment", value === "yes")} {...selectClassNames} />
              </Field>
            </div>
            {values.rentsEquipment && (
              <Field label="Equipamentos disponíveis para aluguer">
                <Textarea variant="secondary" className="min-h-28" value={values.equipmentName} disabled={isSaving} onChange={(e) => set("equipmentName", e.target.value)} />
              </Field>
            )}
          </>
        )}

        <SectionTitle>Competências</SectionTitle>
        <Field label={`Competências principais (até ${CORE_SKILLS_LIMIT})`}>
          {renderTags(values.coreSkills, (skill) => set("coreSkills", values.coreSkills.filter((item) => item !== skill)))}
          <Select
            variant="secondary"
            value=""
            placeholder="Adicionar competência principal"
            options={coreSkillOptions}
            disabled={isSaving || values.coreSkills.length >= CORE_SKILLS_LIMIT}
            onChange={(value) => {
              const label = coreSkillOptions.find((option) => option.value === value)?.label ?? value;
              if (label) set("coreSkills", [...values.coreSkills, label]);
            }}
            {...selectClassNames}
          />
        </Field>
        <Field label="Competências">
          {renderTags(values.skills, (skill) => set("skills", values.skills.filter((item) => item !== skill)))}
          <Select
            variant="secondary"
            value=""
            placeholder="Adicionar competência"
            options={skillOptions}
            disabled={isSaving}
            onChange={(value) => {
              const label = skillOptions.find((option) => option.value === value)?.label ?? value;
              if (label) set("skills", [...values.skills, label]);
            }}
            {...selectClassNames}
          />
        </Field>

        <SectionTitle>Biografia</SectionTitle>
        <Field label={`Biografia (${values.bio.length}/${BIO_MAX_LENGTH})`}>
          <Textarea variant="secondary" className="min-h-37.5" maxLength={BIO_MAX_LENGTH} value={values.bio} disabled={isSaving} onChange={(e) => set("bio", e.target.value.slice(0, BIO_MAX_LENGTH))} />
        </Field>

        <SectionTitle>Redes sociais</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {socialFields.map((field) => (
            <Field key={field.key} label={field.label} error={errors[field.key]}>
              <Input
                variant="secondary"
                placeholder={field.placeholder}
                value={values.socialLinks[field.key]}
                disabled={isSaving}
                onChange={(e) => {
                  setValues((current) => ({ ...current, socialLinks: { ...current.socialLinks, [field.key]: e.target.value } }));
                  setErrors((current) => ({ ...current, [field.key]: undefined }));
                }}
              />
            </Field>
          ))}
        </div>

        <SectionTitle>Visibilidade</SectionTitle>
        <Field label="Perfil na Rede">
          <Select
            variant="secondary"
            options={[{ label: "Visível", value: "visible" }, { label: "Oculto", value: "hidden" }]}
            value={values.isVisible ? "visible" : "hidden"}
            disabled={isSaving}
            onChange={(value) => set("isVisible", value === "visible")}
            {...selectClassNames}
          />
        </Field>
      </div>

      {submitError && (
        <Text className="mt-6 text-[14px] leading-5 text-rede-red">{submitError}</Text>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" disabled={isSaving} onClick={handleClose}>
          Cancelar
        </Button>
        <Button disabled={isSaving} onClick={handleSave} className="text-rede-surface">
          {isSaving ? "A guardar..." : "Guardar"}
        </Button>
      </div>
    </Modal>
  );
};
