import type { Metadata } from "next";
import { customBlur } from "../fonts";
import { Heading } from "@/components/ui/heading";
import { ResetPassword } from "@/components/Auth/ResetPassword";

export const metadata: Metadata = {
    title: "Recuperar palavra-passe",
    robots: { index: false, follow: false },
};

type Props = {
    searchParams: Promise<{
        token?: string;
    }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
    const { token } = await searchParams;

    return (
        <main className="bg-rede-bg">
            <div className="w-full min-h-screen bg-[url('/assets/signup/signup.png')] bg-cover bg-center flex justify-center items-start md:items-center overflow-y-auto py-10 pt-28 pb-10">
                <div className="w-md max-w-[calc(100vw-32px)] bg-rede-surface p-6">
                    <div className="w-full h-auto flex flex-col items-center gap-4 mb-8">
                        <Heading className={`${customBlur.className} text-rede-white text-[48px] leading-14 text-center`}>
                            {token ? "Nova palavra-passe" : "Recuperar acesso"}
                        </Heading>
                    </div>

                    <ResetPassword token={token ?? ""} />
                </div>
            </div>
        </main>
    );
}
