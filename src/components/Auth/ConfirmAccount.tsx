"use client"

import { Text } from "../ui/text";
import { SubmitEvent } from 'react';
import { Button } from "../ui/button";
import { useState } from "react";
import { confirmAccountAndChangePassword } from "@/actions/authentication";
import { useAuth } from "@/hooks/useAuth";
import { ResendConfirmation } from "./ResendConfirmation";
import { NewPasswordFields, validateNewPassword } from "./NewPasswordFields";

export const ConfirmAccount: React.FC<{ token: string }> = ({ token }) => {
    const { updaInternalDataState } = useAuth();
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [successInfo, setSuccessInfo] = useState<boolean>(false);
    // O back recusou o token (invalido, expirado ou ja usado): so resta pedir um novo link
    const [tokenRejectedMessage, setTokenRejectedMessage] = useState<string>("");


    const submitForm = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setMessage("");

        const passwordError = validateNewPassword(password, rePassword);
        if (passwordError) {
            setMessage(passwordError);
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

                <NewPasswordFields
                    password={password}
                    confirmation={rePassword}
                    onPasswordChange={setPassword}
                    onConfirmationChange={setRePassword}
                />

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
