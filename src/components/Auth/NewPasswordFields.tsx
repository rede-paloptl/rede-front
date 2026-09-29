"use client"

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/Input";

// Os mesmos limites que a API aplica (resetPasswordSchema).
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

/** A mensagem a mostrar, ou null quando a palavra-passe pode seguir para a API. */
export const validateNewPassword = (password: string, confirmation: string): string | null => {
    if (password.length < MIN_PASSWORD_LENGTH) return `A palavra-passe deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    if (password.length > MAX_PASSWORD_LENGTH) return `A palavra-passe pode ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`;
    if (password !== confirmation) return "Confirme a palavra-passe nos dois campos.";

    return null;
};

type PasswordInputProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
};

const PasswordInput: React.FC<PasswordInputProps> = ({ id, label, value, onChange }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className='flex flex-col gap-2'>
            <label className='text-[20px] leading-7' htmlFor={id}>{label}</label>
            <Input
                variant={"secondary"}
                placeholder='********'
                type={isVisible ? "text" : "password"}
                autoComplete='new-password'
                className='w-full'
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                icon={isVisible ? <Eye width={12} height={12} /> : <EyeOff width={12} height={12} />}
                iconPosition={"right"}
                onIconClick={() => setIsVisible((lastState) => !lastState)}
            />
        </div>
    );
};

type NewPasswordFieldsProps = {
    password: string;
    confirmation: string;
    onPasswordChange: (value: string) => void;
    onConfirmationChange: (value: string) => void;
};

/** Nova palavra-passe e a sua confirmação (confirmar conta e recuperar acesso). */
export const NewPasswordFields: React.FC<NewPasswordFieldsProps> = ({
    password,
    confirmation,
    onPasswordChange,
    onConfirmationChange,
}) => (
    <>
        <PasswordInput id='passField' label='Palavra-passe' value={password} onChange={onPasswordChange} />
        <PasswordInput id='repassField' label='Confirme' value={confirmation} onChange={onConfirmationChange} />
    </>
);
