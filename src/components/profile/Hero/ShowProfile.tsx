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
    <span className="inline-flex items-center">
      <span className={`inline-flex aspect-square items-center justify-center rounded-full border-[1.3px] p-[14px] ${iconClassName}`}>
        {icon}
      </span>
      <span className={`rounded-[40px] border-[1.3px] px-6 py-3 text-btn2 font-medium ${labelClassName}`}>
        {children}
      </span>
    </span>
  );
};

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
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);
  const displayName = profile?.name || profileData.artisticName || profileData.commercialName || "Perfil";
  const location = [profileData.city, getCountryLabel(profileData.country)].filter(Boolean).join(", ");
  const website = profileData.socialLinks?.website;
  const coreSkills = profileData.coreSkills ?? [];
  const coreSkillsLabel = coreSkills.join(" | ");
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
    <div className='w-full max-w-360 flex gap-5'>
      <div className={`w-53 h-53 relative ${isAuthenticated ? "border-[1.3] border-white" : ""}`}>
        {isAuthenticated && (
          <div className='absolute inset-1 z-10 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100'>
            <Button
              variant={"secondary"}
              disabled={isSaving}
              onClick={() => setIsAvatarCropOpen(true)}
              className='rounded-full p-9 shrink-0 aspect-square flex items-center justify-center'
            >
              <Camera width={12} height={12} />
              <span className="sr-only">Alterar foto</span>
            </Button>
          </div>
        )}
        <Image width={212} height={212} src={profileData.imageUrl || profile?.imageUrl || "/assets/profile/profile.png"} alt={displayName} className='w-full h-full object-cover' />
      </div>
      <div className='flex flex-col'>
        <div className='flex gap-4'>
          <Text className={`${customBlur.className} text-[48px] leading-12 font-medium`}>{displayName}</Text>
          {isAuthenticated && (
            <Button variant="secondary" className="rounded-full p-0 shrink-0 aspect-square w-10 h-10 flex items-center justify-center" onClick={() => setIsEditing?.(!editting)}>
              <Edit2 width={12} height={12} />
            </Button>
          )}
        </div>

        <Text className={`text-[20px] leading-5 font-medium mt-2.5 ${!coreSkillsLabel ? 'text-rede-white/70' : ''}`
        }>{coreSkillsLabel || "Competências principais"}</Text>

        {/* {
          profileData.username &&
          <Text className='text-[14px] leading-5 text-rede-white/70 mt-1'>@{profileData.username}</Text>
        } */}

        {hasContacts && (
          <div className='w-full flex flex-wrap gap-5 mt-5'>
            {location && (
              isAuthenticated ? (
                <Button variant={"secondary"} icon={<MapPin width={12} height={12} />} iconPosition='left'>
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
                <Button variant={"secondary"} icon={<Mail width={12} height={12} />} iconPosition='left'>
                  {profileData.professionalEmail}
                </Button>
              ) : (
                <Link href={"mailto:" + profileData.professionalEmail} target="_blank">
                  <StaticContactChip icon={<Mail width={12} height={12} />}>
                    {profileData.professionalEmail}
                  </StaticContactChip>
                </Link>
              )
            )}
            {website && (
              isAuthenticated ? (
                <Button variant={"secondary"} icon={<GlobeIcon width={12} height={12} />} iconPosition='left'>
                  {website.replace(/^https?:\/\//, "")}
                </Button>
              ) : (
                <Link href={website} target="_blank">
                  <StaticContactChip icon={<GlobeIcon width={12} height={12} />}>
                    {website.replace(/^https?:\/\//, "")}
                  </StaticContactChip>
                </Link>
              )
            )}
          </div>
        )}

        {profileData.professionalPhone && (
          <div className='w-full flex flex-wrap gap-5 mt-5'>
            {isAuthenticated ? (
              <Button icon={<PhoneIcon width={12} height={12} color='black' />} iconPosition='left' className='bg-rede-yellow border-none text-rede-surface' iconButtonClassName="border-none">
                Contactar
              </Button>
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

      <Modal open={isAvatarCropOpen} onClose={() => setIsAvatarCropOpen(false)} panelClassName="flex justify-center rounded-none border-[1.3px] border-rede-white/20">
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