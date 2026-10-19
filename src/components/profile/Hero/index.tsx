"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { User } from "@/types/User";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ImageCropUploader } from "@/components/ImageCropUploader";
import { EditProfile, ProfileHeroDraft } from "./EditProfile";
import { ShowProfile } from "./ShowProfile";
import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";

type ProfileData = User["profileData"];

type HeroProps = {
  profile?: User;
  profileData: ProfileData;
  isAuthenticated?: boolean;
  isSaving?: boolean;
  onSaveProfileData?: (
    patch: Partial<ProfileData>,
    userPatch?: Partial<Pick<User, "name">>,
  ) => Promise<boolean>;
  onImageUploadError?: (message: string) => void;
};

export const Hero: React.FC<HeroProps> = ({
  isAuthenticated = false,
  profile,
  profileData,
  isSaving = false,
  onSaveProfileData,
  onImageUploadError,
}) => {
  const { placeholders } = useSiteSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [isCoverCropOpen, setIsCoverCropOpen] = useState(false);

  const handleSave = async (draft: ProfileHeroDraft) => {
    const saved = await onSaveProfileData?.(
      {
        coreSkills: draft.coreSkills,
        skills: draft.skills,
        username: draft.username,
      },
      {
        name: draft.name,
      },
    );

    if (saved) {
      setIsEditing(false);
    }
  };

  const handleCoverUploaded = async (url: string) => {
    const saved = await onSaveProfileData?.({
      coverImageUrl: url,
    });

    if (saved) {
      setIsCoverCropOpen(false);
      return;
    }

    onImageUploadError?.("Não foi possível guardar a capa no perfil.");
  };

  const handleCloseCoverCrop = () => {
    if (!isSaving) {
      setIsCoverCropOpen(false);
    }
  };

  return (
    <section className="h-auto w-full">
      <div className="relative mx-auto w-full max-w-480 overflow-hidden lg:h-124.25">
        <Image
          src={profileData.coverImageUrl || placeholders.profileCoverUrl}
          alt="Capa do perfil"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/55 lg:bg-transparent"
        />

        {isAuthenticated && (
          // No telemovel fica no fundo da capa, longe do menu do topo.
          <div className="absolute bottom-4 right-4 z-20 sm:right-6 lg:bottom-auto lg:top-6">
            <Button
              variant="secondary"
              disabled={isSaving}
              icon={<Camera width={12} height={12} aria-hidden="true" />}
              iconPosition="left"
              onClick={() => setIsCoverCropOpen(true)}
              className="min-h-10 whitespace-nowrap px-4 sm:px-6"
            >
              Alterar capa
            </Button>
          </div>
        )}

        {/* Telemovel e tablet: o conteudo define a altura (sem scroll interno). Desktop: sobre a capa, ao centro. */}
        <div className={`relative z-10 flex items-center justify-center px-4 pt-28 sm:px-6 sm:pt-32 lg:absolute lg:inset-0 lg:p-0 ${isAuthenticated ? "pb-20" : "pb-10"} lg:pb-0`}>
          {isEditing ? (
            <EditProfile
              profile={profile}
              profileData={profileData}
              isSaving={isSaving}
              setIsEditing={setIsEditing}
              onSave={handleSave}
              onSaveProfileData={onSaveProfileData}
            />
          ) : (
            <ShowProfile
              isAuthenticated={isAuthenticated}
              profile={profile}
              profileData={profileData}
              isSaving={isSaving}
              editting={isEditing}
              setIsEditing={setIsEditing}
              onSaveProfileData={onSaveProfileData}
              onImageUploadError={onImageUploadError}
            />
          )}
        </div>
        
      </div>

      <Modal
        open={isCoverCropOpen}
        onClose={handleCloseCoverCrop}
        closeOnBackdropClick={false}
        panelClassName="mx-4 w-[calc(100%-2rem)] max-w-3xl rounded-none border-[1.3px] border-rede-white/20 sm:mx-auto sm:w-full"
      >
        <ImageCropUploader
          value={profileData.coverImageUrl}
          purpose="cover-image"
          aspectRatio={16 / 9}
          minHeight={320}
          uploadLabel="Guardar capa"
          helperText="Arraste a imagem e ajuste o zoom para enquadrar a capa do perfil."
          disabled={isSaving}
          onUploaded={handleCoverUploaded}
          onError={onImageUploadError}
        />
      </Modal>
    </section>
  );
};