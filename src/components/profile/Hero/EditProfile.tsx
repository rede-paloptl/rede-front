"use client"

import Image from "next/image"
import { Text } from "../../ui/text"
import { Input } from "../../ui/Input"
import { Button } from "../../ui/button"
import { Dispatch, ReactNode, SetStateAction, useState } from "react"
import { User } from "@/types/User"
import { SocialLinks, SocialNetwork } from "@/types/Profile"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Heading } from "@/components/ui/heading"
import { Tag } from "@/components/ui/tag"
import { customBlur } from "@/app/fonts"
import { socialFields } from "@/components/Auth/data"
import { getCoreSkillOptions } from "../Bio/SectionEditSkills"
import { Film, GlobeIcon, Mail, MonitorPlay, Music2, PhoneIcon, X } from "lucide-react"
import Facebook from "@/icons/Facebook"
import Instagram from "@/icons/Instagram"
import Linkedin from "@/icons/Linkedin"

type ProfileData = User["profileData"];

export type ProfileHeroDraft = {
  name: string;
  username: string;
  coreSkills: string[];
  skills: string[];
};

type EditProfileType = {
  profile?: User;
  profileData: ProfileData;
  isSaving?: boolean;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  onSave?: (draft: ProfileHeroDraft) => void | Promise<void>;
  onSaveProfileData?: (patch: Partial<ProfileData>) => Promise<boolean>;
}

type ContactsDraft = {
  professionalEmail: string;
  professionalPhone: string;
  socialLinks: SocialLinks;
};

// A lucide 1.x já não traz ícones de marca, por isso os das redes vêm de
// src/icons; o YouTube, o TikTok e o IMDb não existem em nenhum dos dois e
// ficam com um ícone neutro do mesmo traço.
const socialIcons: Record<SocialNetwork, ReactNode> = {
  website: <GlobeIcon width={16} height={16} />,
  facebook: <Facebook size={16} />,
  instagram: <Instagram size={16} />,
  linkedin: <Linkedin size={16} />,
  youtube: <MonitorPlay width={16} height={16} />,
  tiktok: <Music2 width={16} height={16} />,
  imdb: <Film width={16} height={16} />,
};

// O website é o único destes links que aparece no topo do perfil, por isso
// abre a lista.
const orderedSocialFields = [
  ...socialFields.filter((field) => field.key === "website"),
  ...socialFields.filter((field) => field.key !== "website"),
];

const fieldGroupClassName = "flex flex-col gap-2";
const fieldLabelClassName = "text-[14px] leading-5 font-medium text-rede-white/70";

const buildContactsDraft = (profileData: ProfileData): ContactsDraft => ({
  professionalEmail: profileData.professionalEmail ?? "",
  professionalPhone: profileData.professionalPhone ?? "",
  socialLinks: { ...(profileData.socialLinks ?? {}) },
});

// Aceita o que a pessoa escrever: um endereço completo fica como está, um
// "@nome" vira o perfil da rede respetiva e um domínio solto ganha o https://.
const socialDomains: Record<SocialNetwork, string> = {
  website: "",
  facebook: "facebook.com",
  instagram: "instagram.com",
  linkedin: "linkedin.com/in",
  youtube: "youtube.com",
  tiktok: "tiktok.com",
  imdb: "imdb.com/name",
};

// O YouTube e o TikTok mantêm o @ no endereço (youtube.com/@canal); as outras
// redes usam só o nome.
const networksThatKeepHandlePrefix: SocialNetwork[] = ["tiktok", "youtube"];

const toSocialUrl = (network: SocialNetwork, value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";
  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;

  const domain = socialDomains[network];

  if (trimmedValue.startsWith("@") && domain) {
    const handle = networksThatKeepHandlePrefix.includes(network)
      ? trimmedValue
      : trimmedValue.slice(1);

    return `https://${domain}/${handle}`;
  }

  return `https://${trimmedValue}`;
};

// Devolve sempre o objeto, mesmo vazio: enviar undefined faria o JSON perder o
// campo e apagar todas as redes deixaria de ter efeito.
const normalizeSocialLinks = (socialLinks: SocialLinks): SocialLinks =>
  Object.entries(socialLinks).reduce<SocialLinks>((links, [network, value]) => {
    const url = toSocialUrl(network as SocialNetwork, String(value ?? ""));

    if (url) links[network as SocialNetwork] = url;

    return links;
  }, {});

const uniqueSkills = (skills: string[]): string[] => {
  const seen = new Set<string>();

  return skills.filter((skill) => {
    const normalizedSkill = skill.trim();
    const normalizedKey = normalizedSkill.toLowerCase();

    if (!normalizedSkill || seen.has(normalizedKey)) return false;

    seen.add(normalizedKey);
    return true;
  });
};

export const EditProfile: React.FC<EditProfileType> = ({
  profile,
  profileData,
  isSaving = false,
  setIsEditing,
  onSave,
  onSaveProfileData
}) => {
  const initialCoreSkills = uniqueSkills(profileData.coreSkills ?? []).slice(0, 3);

  const [draft, setDraft] = useState<ProfileHeroDraft>({
    name: profile?.name ?? "",
    username: profileData.username ?? "",
    coreSkills: initialCoreSkills,
    skills: uniqueSkills([...(profileData.skills ?? []), ...initialCoreSkills]),
  });

  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactsDraft>(() => buildContactsDraft(profileData));

  const filledContacts = [
    profileData.professionalEmail,
    profileData.professionalPhone,
    ...Object.values(profileData.socialLinks ?? {}),
  ].filter(Boolean).length;

  // Reparte sempre do que está guardado, para o modal não abrir com edições
  // que a pessoa já tinha descartado antes.
  const openContacts = () => {
    setContacts(buildContactsDraft(profileData));
    setIsContactsOpen(true);
  };

  const updateContact = (key: "professionalEmail" | "professionalPhone", value: string) => {
    setContacts((lastState) => ({ ...lastState, [key]: value }));
  };

  const updateSocialLink = (network: SocialNetwork, value: string) => {
    setContacts((lastState) => ({
      ...lastState,
      socialLinks: { ...lastState.socialLinks, [network]: value },
    }));
  };

  // Os contactos guardam-se sozinhos, como já acontece com a foto e a capa —
  // assim não há um rascunho dentro de outro rascunho.
  const handleContactsSave = async () => {
    const saved = await onSaveProfileData?.({
      professionalEmail: contacts.professionalEmail.trim(),
      professionalPhone: contacts.professionalPhone.trim(),
      socialLinks: normalizeSocialLinks(contacts.socialLinks),
    });

    if (saved) setIsContactsOpen(false);
  };

  const updateDraft = (key: "name" | "username", value: string) => {
    setDraft((lastState) => ({ ...lastState, [key]: value }));
  };

  const skillOptions = getCoreSkillOptions(profileData).filter((option) => {
    const normalizedCoreSkills = draft.coreSkills.map((skill) => skill.toLowerCase());

    return (
      !normalizedCoreSkills.includes(option.label.toLowerCase()) &&
      !normalizedCoreSkills.includes(option.value.toLowerCase())
    );
  });

  const handleCoreSkillAdd = (value: string) => {
    if (draft.coreSkills.length >= 3) return;

    const selectedOption = skillOptions.find((option) => option.value === value);
    const coreSkill = selectedOption?.label ?? value;
    const normalizedCoreSkill = coreSkill.trim();

    if (!normalizedCoreSkill) return;

    setDraft((lastState) => ({
      ...lastState,
      coreSkills: uniqueSkills([...lastState.coreSkills, normalizedCoreSkill]).slice(0, 3),
      skills: uniqueSkills([...lastState.skills, normalizedCoreSkill]),
    }));
  };

  const removeCoreSkill = (coreSkill: string) => {
    setDraft((lastState) => ({
      ...lastState,
      coreSkills: lastState.coreSkills.filter((skill) => skill !== coreSkill),
      skills: lastState.skills.filter((skill) => skill !== coreSkill),
    }));
  };

  return (
    <div className='w-full max-w-360 flex gap-5 pt-20'>
      <div className='w-53 h-53'>
        <Image
          width={212}
          height={212}
          src={profileData.imageUrl || profile?.imageUrl || "/assets/profile/profile.png"}
          alt={profile?.name || 'Perfil'}
          className='w-full h-full object-cover'
        />
      </div>
      <div className='flex flex-col gap-4'>
        <div className='w-full flex flex-col gap-2'>

          <div className="w-full flex gap-4">
            <div className='flex flex-col gap-2'>
              <Text className='text-[20px] leading-7 font-medium'>Nome</Text>
              <Input
                variant={"secondary"}
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
                placeholder='Nome'
                className='bg-transparent'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Text className='text-[20px] leading-7 font-medium'>Competências principais</Text>

              <div className="flex flex-col gap-2">
                <div className="flex min-h-11 w-[450px] flex-wrap items-center gap-2 border-[1.3px] border-white px-3 py-2 rounded-[8px]">
                  {draft.coreSkills.length > 0 ? draft.coreSkills.map((coreSkill) => (
                    <Tag key={coreSkill} className="flex items-center gap-1 bg-rede-surface">
                      {coreSkill}
                      <X
                        width={12}
                        height={12}
                        color="#ffffff"
                        className="cursor-pointer"
                        onClick={() => removeCoreSkill(coreSkill)}
                      />
                    </Tag>
                  )) : (
                    <Text className="text-[14px] leading-[20px] text-rede-white/70">Selecione até 3 competências</Text>
                  )}
                </div>

                <Select
                  variant="secondary"
                  value=""
                  placeholder="Adicionar competência"
                  options={skillOptions}
                  disabled={draft.coreSkills.length >= 3}
                  triggerClassName="border-[1.3px] border-white px-3 text-rede-white outline-none"
                  popoverClassName="rounded-[8px] border-[1.3px] border-white px-3 text-rede-white outline-none mt-[10px]"
                  satelliteClassName="border-[1.3px] border-white"
                  onChange={handleCoreSkillAdd}
                />
              </div>
            </div>
          </div>

          {/* 
          <div className='flex flex-col gap-2'>
            <Text className='text-[20px] leading-7 font-medium'>Nome de utilizador</Text>
            <Input
              variant={"secondary"}
              value={draft.username}
              onChange={(event) => updateDraft("username", event.target.value)}
              placeholder='nome-de-utilizador'
              className='max-w-[350px] bg-transparent'
            />
          </div> 
          */}

          <div className='flex flex-col gap-2'>
            <Text className='text-[20px] leading-7 font-medium'>Contactos e redes</Text>

            <div className='flex items-center gap-3'>
              <Button
                variant={"secondary"}
                disabled={isSaving}
                icon={<Mail width={12} height={12} />}
                iconPosition='left'
                onClick={openContacts}
              >
                Editar contactos e redes
              </Button>

              <Text className='text-[14px] leading-5 text-rede-white/70'>
                {filledContacts > 0
                  ? `${filledContacts} preenchido${filledContacts > 1 ? "s" : ""}`
                  : "Nenhum preenchido"}
              </Text>
            </div>
          </div>

          <div className='w-full flex gap-1'>
            <Button disabled={isSaving} onClick={() => onSave?.(draft)}>
              {isSaving ? "A guardar..." : "Guardar"}
            </Button>

            <Button variant={"secondary"} disabled={isSaving} onClick={() => setIsEditing?.((lastState) => !lastState)}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={isContactsOpen}
        onClose={() => !isSaving && setIsContactsOpen(false)}
        panelClassName="rounded-none border-[1.3px] border-rede-white/20 p-6 sm:p-8"
      >
        <Heading className={`${customBlur.className} text-[32px] leading-9 font-medium`}>
          Contactos e redes
        </Heading>

        <Text className='mt-2 text-[14px] leading-5 text-rede-white/70'>
          O email, o telefone e o website aparecem no topo do teu perfil. As restantes
          redes ficam guardadas no perfil.
        </Text>

        <div className='mt-6 flex flex-col gap-3'>
          <Text className='text-[16px] leading-6 font-medium'>Contacto</Text>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className={fieldGroupClassName}>
              <label className={fieldLabelClassName} htmlFor='professionalEmailField'>
                Email profissional
              </label>
              <Input
                id='professionalEmailField'
                variant={"secondary"}
                type='email'
                icon={<Mail width={16} height={16} />}
                iconPosition='left'
                placeholder='nome@dominio.com'
                value={contacts.professionalEmail}
                onChange={(event) => updateContact("professionalEmail", event.target.value)}
                className='bg-transparent'
              />
            </div>

            <div className={fieldGroupClassName}>
              <label className={fieldLabelClassName} htmlFor='professionalPhoneField'>
                Telefone profissional
              </label>
              <Input
                id='professionalPhoneField'
                variant={"secondary"}
                type='tel'
                icon={<PhoneIcon width={16} height={16} />}
                iconPosition='left'
                placeholder='+244 900 000 000'
                value={contacts.professionalPhone}
                onChange={(event) => updateContact("professionalPhone", event.target.value)}
                className='bg-transparent'
              />
            </div>
          </div>
        </div>

        <div className='mt-6 flex flex-col gap-3'>
          <Text className='text-[16px] leading-6 font-medium'>Redes e links</Text>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {orderedSocialFields.map((field) => (
              <div className={fieldGroupClassName} key={field.key}>
                <label className={fieldLabelClassName} htmlFor={`${field.key}Field`}>
                  {field.label}
                </label>
                <Input
                  id={`${field.key}Field`}
                  variant={"secondary"}
                  icon={socialIcons[field.key]}
                  iconPosition='left'
                  placeholder={field.placeholder}
                  value={contacts.socialLinks[field.key] ?? ""}
                  onChange={(event) => updateSocialLink(field.key, event.target.value)}
                  className='bg-transparent'
                />
              </div>
            ))}
          </div>
        </div>

        <div className='mt-8 flex gap-1'>
          <Button disabled={isSaving} onClick={handleContactsSave}>
            {isSaving ? "A guardar..." : "Guardar contactos"}
          </Button>

          <Button variant={"secondary"} disabled={isSaving} onClick={() => setIsContactsOpen(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
};
