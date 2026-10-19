import Image from "next/image"
import { Text } from "../../ui/text"
import { Button } from "../../ui/button"
import { Dispatch, ReactNode, SetStateAction, useState } from "react"
import { User } from "@/types/User"
import { Camera, Edit2, GlobeIcon, Mail, MapPin, PhoneIcon } from "lucide-react"
import { customBlur } from "@/app/fonts"
import { Modal } from "@/components/ui/modal"
import { ImageCropUploader } from "@/components/ImageCropUploader"
import Link from "next/link"
import { getCountryLabel } from "@/components/network/filters"
import { getTaxonomy } from "@/lib/taxonomy"
import { toSkillLabel } from "../Bio/SectionEditSkills"
import { EditDataModal } from "./EditDataModal"
import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";

type ProfileData = User["profileData"];

type ShowProfileType = {
  profile?: User;
  profileData: ProfileData;
  isAuthenticated?: boolean;
  isSaving?: boolean;
  editting?: boolean;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  onSaveProfileData?: (patch: Partial<ProfileData>, userPatch?: Partial<Pick<User, "name">>) => Promise<boolean>;
  onImageUploadError?: (message: string) => void;
}

const StaticContactChip = ({
  children,
  icon,
  variant = "secondary",
}: {
  children: ReactNode;
  icon: ReactNode;
  variant?: "primary" | "secondary";
}) => {
  const isPrimary = variant === "primary";
  const iconClassName = isPrimary
    ? "border-rede-yellow bg-rede-yellow text-rede-surface"
    : "border-rede-white text-rede-white";
  const labelClassName = isPrimary
    ? "border-rede-yellow bg-rede-yellow text-rede-surface"
    : "border-rede-white text-rede-white";

  return (
    <span className="inline-flex max-w-full items-center">
      <span className={`inline-flex aspect-square shrink-0 items-center justify-center rounded-full border-[1.3px] p-3 sm:p-[14px] ${iconClassName}`}>
        {icon}
      </span>
      <span className={`min-w-0 truncate rounded-[40px] border-[1.3px] px-4 py-2.5 text-btn2 font-medium sm:px-6 sm:py-3 ${labelClassName}`}>
        {children}
      </span>
    </span>
  );
};

// Contactos longos (email, site) cortam com "…" em vez de sair do ecra.
const contactContainerClassName = "max-w-full";
const contactLabelClassName = "min-w-0 truncate";

export const ShowProfile: React.FC<ShowProfileType> = ({
  profile,
  profileData,
  isAuthenticated = false,
  isSaving = false,
  setIsEditing,
  editting,
  onSaveProfileData,
  onImageUploadError,
}) => {
  const { placeholders } = useSiteSettings();
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // So fecha o modal depois de o servidor confirmar a gravacao.
  const handleSaveData = async (patch: Partial<ProfileData>, userPatch: Pick<User, "name">) => {
    const saved = Boolean(await onSaveProfileData?.(patch, userPatch));

    if (saved) setIsDataModalOpen(false);

    return saved;
  };

  const displayName = profile?.name || profileData.artisticName || profileData.commercialName || "Perfil";
  const location = [getTaxonomy().label(profileData.city, ["city"]), getCountryLabel(profileData.country)].filter(Boolean).join(", ");
  const website = profileData.socialLinks?.website;
  const coreSkills = profileData.coreSkills ?? [];
  const coreSkillsLabel = coreSkills.map(toSkillLabel).join(" | ");
  const hasContacts = Boolean(location || profileData.professionalEmail || website);

  const handleAvatarUploaded = async (url: string) => {
    const saved = await onSaveProfileData?.({ imageUrl: url });

    if (saved) {
      setIsAvatarCropOpen(false);
      return;
    }

    onImageUploadError?.("N\u00e3o foi poss\u00edvel guardar a foto no perfil.");
  };

  return (
    // Telemovel: foto em cima e tudo centrado; a partir de lg, foto ao lado dos dados.
    <div className='flex w-full max-w-360 flex-col items-center gap-5 text-center lg:flex-row lg:items-start lg:text-left'>
      <div className={`relative size-32 shrink-0 sm:size-40 lg:size-53 ${isAuthenticated ? "border-[1.3] border-white" : ""}`}>
        {isAuthenticated && (
          <div className='absolute inset-1 z-10 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100'>
            <Button
              variant={"secondary"}
              disabled={isSaving}
              onClick={() => setIsAvatarCropOpen(true)}
              className='rounded-full p-5 shrink-0 aspect-square flex items-center justify-center lg:p-9'
            >
              <Camera width={12} height={12} />
              <span className="sr-only">Alterar foto</span>
            </Button>
          </div>
        )}
        <Image width={212} height={212} src={profileData.imageUrl || profile?.imageUrl || placeholders.profileImageUrl} alt={displayName} className='w-full h-full object-cover' />
      </div>
      <div className='flex w-full min-w-0 flex-col items-center lg:items-start'>
        <div className='flex max-w-full items-center gap-3 lg:items-start lg:gap-4'>
          <Text className={`${customBlur.className} min-w-0 break-words text-[32px] leading-9 font-medium sm:text-[40px] sm:leading-11 lg:text-[48px] lg:leading-12`}>{displayName}</Text>
          {isAuthenticated && (
            <Button variant="secondary" className="rounded-full p-0 shrink-0 aspect-square w-10 h-10 flex items-center justify-center" onClick={() => setIsEditing?.(!editting)}>
              <Edit2 width={12} height={12} />
            </Button>
          )}
        </div>

        <Text className={`mt-2.5 text-[16px] leading-6 font-medium lg:text-[20px] lg:leading-5 ${!coreSkillsLabel ? 'text-rede-white/70' : ''}`
        }>{coreSkillsLabel || "Competências principais"}</Text>

        {/* {
          profileData.username &&
          <Text className='text-[14px] leading-5 text-rede-white/70 mt-1'>@{profileData.username}</Text>
        } */}

        {hasContacts && (
          <div className='mt-5 flex w-full flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start lg:gap-5'>
            {location && (
              isAuthenticated ? (
                <Button variant={"secondary"} icon={<MapPin width={12} height={12} />} iconPosition='left' containerClassName={contactContainerClassName} className={contactLabelClassName}>
                  {location}
                </Button>
              ) : (
                <StaticContactChip icon={<MapPin width={12} height={12} />}>
                  {location}
                </StaticContactChip>
              )
            )}
            {profileData.professionalEmail && (
              isAuthenticated ? (
                <Button variant={"secondary"} icon={<Mail width={12} height={12} />} iconPosition='left' containerClassName={contactContainerClassName} className={contactLabelClassName}>
                  {profileData.professionalEmail}
                </Button>
              ) : (
                <Link href={"mailto:" + profileData.professionalEmail} target="_blank" className="max-w-full">
                  <StaticContactChip icon={<Mail width={12} height={12} />}>
                    {profileData.professionalEmail}
                  </StaticContactChip>
                </Link>
              )
            )}
            {website && (
              isAuthenticated ? (
                <Button variant={"secondary"} icon={<GlobeIcon width={12} height={12} />} iconPosition='left' containerClassName={contactContainerClassName} className={contactLabelClassName}>
                  {website.replace(/^https?:\/\//, "")}
                </Button>
              ) : (
                <Link href={website} target="_blank" className="max-w-full">
                  <StaticContactChip icon={<GlobeIcon width={12} height={12} />}>
                    {website.replace(/^https?:\/\//, "")}
                  </StaticContactChip>
                </Link>
              )
            )}
          </div>
        )}

        {(profileData.professionalPhone || isAuthenticated) && (
          <div className='mt-3 flex w-full flex-wrap justify-center gap-3 sm:mt-5 lg:justify-start lg:gap-5'>
            {isAuthenticated ? (
              <>
                {profileData.professionalPhone && (
                  <Button icon={<PhoneIcon width={12} height={12} color='black' />} iconPosition='left' className='bg-rede-yellow border-none text-rede-surface' iconButtonClassName="border-none">
                    Contactar
                  </Button>
                )}
                <Button variant={"secondary"} disabled={isSaving} icon={<Edit2 width={12} height={12} />} iconPosition='left' onClick={() => setIsDataModalOpen(true)}>
                  Editar dados
                </Button>
              </>
            ) : (
              <Link href={"tel:" + profileData.professionalPhone} target="_blank">
                <StaticContactChip icon={<PhoneIcon width={12} height={12} />} variant="primary">
                  {profileData.professionalPhone}
                </StaticContactChip>
              </Link>
            )}
          </div>
        )}
      </div>

      <EditDataModal
        open={isDataModalOpen}
        profile={profile}
        profileData={profileData}
        isSaving={isSaving}
        onClose={() => setIsDataModalOpen(false)}
        onSave={handleSaveData}
      />

      <Modal open={isAvatarCropOpen} onClose={() => setIsAvatarCropOpen(false)} closeOnBackdropClick={false} panelClassName="flex justify-center rounded-none border-[1.3px] border-rede-white/20">
        <ImageCropUploader
          className="w-[350px]"
          height={350}
          value={profileData.imageUrl || profile?.imageUrl}
          purpose="profile-image"
          aspectRatio={1}
          cropShape="circle"
          //minHeight={420}
          uploadLabel="Guardar foto"
          helperText="Arraste e ajuste o zoom para enquadrar a foto de perfil."
          disabled={isSaving}
          onUploaded={handleAvatarUploaded}
          onError={onImageUploadError}
        />
      </Modal>
    </div>
  )
}