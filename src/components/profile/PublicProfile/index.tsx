import { User } from "@/types/User";
import { Hero } from "@/components/profile/Hero";
import { Bio } from "@/components/profile/Bio";
import { Achievements } from "@/components/profile/Achievements";
import { Filmography } from "@/components/profile/Filmography";
import { OutsideAgency } from "@/components/profile/OutsideAgency";

type ProfileData = User["profileData"];

type PublicProfileProps = {
  profile: User;
};

const defaultProfileData: ProfileData = {
  accountType: "individual",
  country: "",
  city: "",
  professionalPhone: "",
  professionalEmail: "",
  birthDate: "",
  artisticName: "",
  commercialName: "",
  creationDate: "",
  isRegistered: false,
  services: [],
  otherService: "",
  coverImageUrl: "",
  imageUrl: "",
};

const hydrateProfileData = (profile: User): ProfileData => ({
  ...defaultProfileData,
  ...profile.profileData,
});

export const PublicProfile: React.FC<PublicProfileProps> = ({ profile }) => {
  const profileData = hydrateProfileData(profile);

  return (
    <>
      <Hero
        isAuthenticated={false}
        profile={profile}
        profileData={profileData}
      />
      <Bio
        isAuthenticated={false}
        profile={profile}
        profileData={profileData}
      />
      <Achievements
        isAuthenticated={false}
        achievements={profileData.achievements}
        films={[...(profileData.filmography ?? []), ...(profileData.outsideAgency ?? [])]}
      />
      <Filmography
        isAuthenticated={false}
        films={profileData.filmography}
        achievements={profileData.achievements}
        accountType={profileData.accountType}
      />
      {/* <OutsideAgency
        isAuthenticated={false}
        films={profileData.outsideAgency}
        achievements={profileData.achievements}
        accountType={profileData.accountType}
      /> */}
    </>
  );
};