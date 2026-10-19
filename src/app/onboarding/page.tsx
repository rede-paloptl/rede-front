

import { OnBoarding } from "@/components/Auth/OnBoarding";
import { AuthBackground } from "@/components/Auth/AuthBackground";


export default function OnBoardingPage() {
  return (
    <AuthBackground variant="signup" className="w-full min-h-screen flex justify-center items-start md:items-center overflow-y-auto py-10 pt-28 pb-10">
      <OnBoarding />
    </AuthBackground>
  )
}