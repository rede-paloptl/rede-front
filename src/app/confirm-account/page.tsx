import { customBlur } from "../fonts";
import { Heading } from "@/components/ui/heading";
import { ConfirmAccount } from "@/components/Auth/ConfirmAccount";

type Props = {
    searchParams: Promise<{
        confirm?: string;
    }>;
};

export default async function ConfirmAccountPage({ searchParams }: Props) {
    const { confirm } = await searchParams;

    return (
        <main className="bg-rede-bg">
            <div className="w-full min-h-screen bg-[url('/assets/signup/signup.png')] bg-cover bg-center flex justify-center items-start md:items-center overflow-y-auto py-10 pt-28 pb-10">
                <div className="w-md max-w-[calc(100vw-32px)] bg-rede-surface p-6">
                    <div className="w-full h-auto flex flex-col items-center gap-4 mb-8">
                        <Heading
                            className={`${customBlur.className} text-rede-white text-[48px] leading-14`}
                        >
                            Confirmar conta
                        </Heading>
                    </div>

                    <ConfirmAccount token={confirm ?? ""} />
                </div>
            </div>
        </main>
    );
}
