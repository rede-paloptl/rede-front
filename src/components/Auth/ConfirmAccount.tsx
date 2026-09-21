"use client"

import { Text } from "../ui/text";
import { SubmitEvent } from 'react';
import { Input } from "../ui/Input";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { confirmAccountAndChangePassword } from "@/actions/authentication";
import { useAuth } from "@/hooks/useAuth";
import { ResendConfirmation } from "./ResendConfirmation";

export const ConfirmAccount: React.FC<{ token: string }> = ({ token }) => {
    const { updaInternalDataState } = useAuth();
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [successInfo, setSuccessInfo] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    // O back recusou o token (invalido, expirado ou ja usado): so resta pedir um novo link
    const [tokenRejectedMessage, setTokenRejectedMessage] = useState<string>("");


    const submitForm = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setMessage("");

        if (password.length < 8) {
            setMessage("A palavra-passe deve ter pelo menos 8 caracteres.");
            return;
        }

        if (password !== rePassword) {
            setMessage("Confirme a palavra-passe nos dois campos.");
            return;
        }

        setIsLoading(true);
        const responseData = await confirmAccountAndChangePassword(token, password);

        if (responseData?.user && responseData?.token) {
            setSuccessInfo(true);
            updaInternalDataState({ profileData: responseData?.user, token: responseData?.token });
            setMessage("Conta confirmada com sucesso! A redirecionar...");

            setTimeout(() => {
                location.href = "/onboarding";
            }, 2000)
            return;
        }

        setIsLoading(false);
        setTokenRejectedMessage(responseData?.message || "Não foi possível confirmar a conta.");
    }


    if (!token || tokenRejectedMessage) {
        return (
            <div className='w-full flex flex-col gap-6'>
                <Text className='text-[14px] leading-5 text-center text-rede-red'>
                    {tokenRejectedMessage || "Este link de confirmação não é válido."}
                </Text>
                <Text className='text-[14px] leading-5 text-center'>
                    Indique o email da sua conta para receber um novo link de confirmação.
                </Text>
                <ResendConfirmation />
            </div>
        )
    }


    return (
        <form onSubmit={submitForm}>
            <div className='w-full flex flex-col gap-6'>
                <Text className='text-[14px] leading-5 text-center'>
                    Defina a palavra-passe da sua conta para concluir a confirmação.
                </Text>

                <div className='flex flex-col gap-2'>
                    <label className='text-[20px] leading-7' htmlFor='passField'>Palavra-passe</label>
                    <Input variant={"secondary"} placeholder='********' type={showPassword ? "text" : "password"} className='w-full' id='passField' value={password} onChange={(event) => setPassword(event.target.value)}
                        icon={showPassword ? <Eye width={12} height={12} /> : <EyeOff width={12} height={12} />}
                        iconPosition={"right"}
                        onIconClick={() => setShowPassword((lastState) => (!lastState))}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-[20px] leading-7' htmlFor='repassField'>Confirme</label>
                    <Input variant={"secondary"} placeholder='********' type={showRePassword ? "text" : "password"} className='w-full' id='repassField' value={rePassword} onChange={(event) => setRePassword(event.target.value)}
                        icon={showRePassword ? <Eye width={12} height={12} /> : <EyeOff width={12} height={12} />}
                        iconPosition={"right"}
                        onIconClick={() => setShowRePassword((lastState) => (!lastState))}
                    />
                </div>

                {(message.length > 0) &&
                    <Text className={`text-[14px] leading-5 ${successInfo ? "text-rede-yellow" : "text-rede-red"} text-center`}>{message}</Text>
                }

                <Button type='submit' containerClassName='w-full' className='text-rede-surface' disabled={isLoading} >
                    {isLoading ? "A processar..." : "Confirmar conta"}
                </Button>
            </div>
        </form>
    )
}
