"use client"

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import Card from "./ui/card";
import { Tag } from "./ui/tag";
import { getNetworkTagHref } from "./network/FilterSidebar";
import { Text } from "./ui/text";
import Link from "next/link";
import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";

export type ProfileType = {
  id: string;
  title: string;
  tags: string[];
  cover: string;
  country?: string;
  province?: string;
  bio?: string;
  city?: string;
  type?: string;
  // Categoria = coreSkills do perfil; Sub-categoria = skills.
  categories?: string[];
  subCategories?: string[];
  // Tudo o que o perfil diz sobre o que faz, para a pesquisa livre.
  terms?: string[];
  username?: string;
}

export const ProfileCard: React.FC<{ profileData: ProfileType }> = ({ profileData }) => {
  const { placeholders } = useSiteSettings();
  const router = useRouter();

  return (
    <Card
      image={
        <Link href={`/${profileData?.username}`} className="cursor-pointer">
          <img src={profileData.cover || placeholders.profileImageUrl} className="w-full h-full object-cover" alt="Diretora no set de filmagem" />
        </Link>
      }
      footer={
        <div className="w-full h-12 flex items-center justify-end gap-4 mt-2">
          {/* 
          <Text className="text-[14px] leading-relaxed font-medium line-clamp-2">
            {profileData.bio}
          </Text> 
          */}


          {
            profileData.username &&
            <Link href={`/${profileData?.username}`} className="cursor-pointer">
              <Button
                showMainButton={false}
                iconPosition="right"
                icon={<ArrowRight width={12} height={12} />}
                disabled={!profileData.username}
              />
            </Link>
          }

        </div>
      }>

      <div className="flex flex-wrap gap-2.5">
        {
          profileData.tags.map((tag, index) => (
            <Tag href={getNetworkTagHref(tag)} label={tag} key={tag + "x" + index} />
          ))
        }
      </div>

      <Heading level={"h3"} className="text-[20px] font-semibold leading-7 mt-1">
        {profileData.title}
      </Heading>

    </Card>
  );
};
