"use client"

import { customBlur } from '@/app/fonts';
import { Heading } from "./ui/heading"
import { Text } from './ui/text';
import { Input } from './ui/Input';
import { EyeOff } from 'lucide-react';
import { SubmitEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { GoogleIcon } from '@/icons/GoogleIcon';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle } from '@/lib/googleAuth';
import { SESSION_EXPIRED_MESSAGE } from '@/actions/constants';


export const Login: React.FC = () => {
    const [message, setMessage] = useState("");
    const { signInUsingEmailAndPassword, signInUsingGoogle } = useAuth();
    const [isError, setIsError] = useState(false);
    const [showMessaage, setShowMessaage] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [sessionNotice, setSessionNotice] = useState("");


    /**
     * Se chegamos aqui por a sessao ter expirado, explicamos porque e que o
     * utilizador foi posto fora. So depois de montar: sessionStorage nao existe
     * no servidor. O aviso e consumido uma unica vez.
     */
    useEffect(() => {
        try {
            const expiredMessage = window.sessionStorage.getItem(SESSION_EXPIRED_MESSAGE);

            if (!expiredMessage) return;

            window.sessionStorage.removeItem(SESSION_EXPIRED_MESSAGE);

            // eslint-disable-next-line react-hooks/set-state-in-effect -- valor so legivel no browser, depois da hidratacao.
            setSessionNotice(expiredMessage);
        } catch {
            // sessionStorage indisponivel: o login funciona na mesma, sem o aviso.
        }
    }, []);


    const handleSigin = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSessionNotice("");

        if (email.length === 0 || password.length === 0) {
            setIsError(true);
            setShowMessaage(true);
            setMessage("Preencha todos os campos.");

            setTimeout(() => {
                setShowMessaage(false);
                setMessage("");
            }, 3000);
            return;
        }

        if (password.length < 8) {
            setIsError(true);
            setShowMessaage(true);
            setMessage("A palavra-passe deve ter min de 8 caracteres.");

            setTimeout(() => {
                setShowMessaage(false);
                setMessage("");
            }, 3000);
            return;
        }

        try {
            const responseData = await signInUsingEmailAndPassword(email, password);

            if (responseData?.error) {
                setIsError(true);
                setShowMessaage(true);
                setMessage(responseData?.message || "Ocorreu um erro ao criar a conta.");

                setTimeout(() => {
                    setShowMessaage(false);
                    setMessage("");
                }, 3000);
                return;
            }

            if (responseData?.user) {
                setIsError(false);
                setShowMessaage(true);
                setMessage("Sessão iniciada com sucesso! A redirecionar...");

                setTimeout(() => {
                    setShowMessaage(false);
                    setMessage("");
                    window.location.href = "/"
                }, 3000);
            }

        } catch (err: any) {
            setIsError(true);
            setShowMessaage(true);
            setMessage("Não foi possível iniciar sessão. Tente novamente.");

            setTimeout(() => {
                setShowMessaage(false);
                setMessage("");
            }, 3000);
        }
    }

    const handleGoogleLogin = async () => {
        setSessionNotice("");
        setShowMessaage(false);
        setGoogleLoading(true);

        try {
            const { idToken } = await signInWithGoogle();
            const responseData = await signInUsingGoogle({ idToken });

            if (responseData?.error) {
                setIsError(true);
                setShowMessaage(true);
                setMessage(responseData?.message || "Não foi possível iniciar sessão com o Google.");

                setTimeout(() => {
                    setShowMessaage(false);
                    setMessage("");
                }, 3000);
                return;
            }

            if (responseData?.user) {
                setIsError(false);
                setShowMessaage(true);
                setMessage("Sessão iniciada com sucesso! A redirecionar...");

                setTimeout(() => {
                    setShowMessaage(false);
                    setMessage("");
                    window.location.href = "/"
                }, 3000);
            }
        } catch (err) {
            setIsError(true);
            setShowMessaage(true);
            setMessage(err instanceof Error ? err.message : "Não foi possível iniciar sessão com o Google.");

            setTimeout(() => {
                setShowMessaage(false);
                setMessage("");
            }, 3000);
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <div className="w-full h-screen bg-[url('/assets/login/login.png')] bg-cover bg-center flex items-center justify-center">
            <div className="w-md hh-173.25 bg-rede-surface p-6">
                <div className="w-full h-auto flex flex-col items-center gap-6">
                    <Heading className={`text-rede-white ${customBlur.className} text-[48px] leading-14`}>Login</Heading>
                    <Text className="text-[14px] leading-5 font-medium">Acesse sua conta na REDE PALOP+TL</Text>
                </div>

                <div className='w-full h-auto'>
                    <form onSubmit={handleSigin}>
                        <div className='w-full flex flex-col gap-6'>
                            <div className='flex flex-col gap-2'>
                                <label className='text-[20px] leading-7' htmlFor='emailField'>Email</label>
                                <Input value={email} type='email' variant={"secondary"} placeholder='seu@email.com' className='w-full' id='emailField' onChange={({ target }) => setEmail(target.value)} />
                            </div>

                            <div className='flex flex-col gap-2'>
                                <label className='text-[20px] leading-7' htmlFor='passField'>Password</label>
                                <Input value={password} minLength={8} variant={"secondary"} type={showPassword ? 'text' : 'password'} placeholder='******' className='w-full' icon={<EyeOff width={12} height={12} />} iconPosition='right' onIconClick={() => setShowPassword((lastState) => (!lastState))} id='passField' onChange={({ target }) => setPassword(target.value)} />
                            </div>
                        </div>

                        <Link href="/reset-pawword" className='flex justify-end mt-4.5'>
                            <Text className='text-[14px] leading-5 font-bold'>Esqueci a senha</Text>
                        </Link>

                        {sessionNotice.length > 0 &&
                            <Text className="text-[14px] leading-5 text-rede-yellow text-center mt-4">{sessionNotice}</Text>
                        }

                        {(showMessaage && message.length > 0) &&
                            <Text className={`text-[14px] leading-5 ${isError ? "text-rede-red" : "text-rede-yellow"} text-center`} dangerouslySetInnerHTML={{ __html: message }} />
                        }


                        <div className='w-full mt-8 mb-8'>
                            <Button type='submit' containerClassName='w-full'>
                                Entrar
                            </Button>
                        </div>
                    </form>

                    <Text className='font-medium leading-7 text-center mt-6 mb-6'>Ou</Text>

                    <div className='w-full h-auto flex flex-col gap-6'>
                        <Button type='button' variant={"secondary"} icon={<GoogleIcon width={12} height={12} />} className='w-full' disabled={googleLoading} onClick={handleGoogleLogin}>
                            {googleLoading ? "A ligar ao Google..." : "Continue com Google"}
                        </Button>
                    </div>

                    <div className='w-full flex justify-center mt-6 mb-6'>
                        <Text className='text-[14px] leading-5 font-bold text-center flex items-center gap-2.5'>
                            Ainda não tem conta
                            <Link href="/signup" className='text-[14px] leading-5 font-bold text-rede-yellow'>
                                Criar conta
                            </Link>
                        </Text>
                    </div>

                </div>
            </div>
        </div>
    )
}

