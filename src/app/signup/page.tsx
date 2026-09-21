import { GuestOnly } from "@/components/Auth/GuestOnly";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Signup } from "@/components/Auth/Signup";

const InformationBox: React.FC = () => {
    return (
        <div className="w-md max-w-[calc(100vw-32px)] bg-rede-surface p-6">
            <div className="w-full h-auto flex flex-col items-center gap-6">
                <Text className="text-[14px] leading-5 font-bold text-rede-yellow text-center">
                    Ainda não é possível criar perfis na REDE. <br />Logo que a funcionalidade esteja disponivel será comunicado.
                </Text>

                <Link href="/">
                    <Button type='submit' containerClassName='w-full' className='text-rede-surface'>
                        Voltar
                    </Button>
                </Link>
            </div>
        </div>
    )
}


export default function SignupPage() {
    return (
        <GuestOnly>
            <div className="w-full min-h-screen bg-[url('/assets/signup/signup.png')] bg-cover bg-center flex justify-center items-start md:items-center overflow-y-auto py-10 pt-28 pb-10">
                {/* <Signup /> */}
                <InformationBox /> 
            </div >
        </GuestOnly>
    )
}


