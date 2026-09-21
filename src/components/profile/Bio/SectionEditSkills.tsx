import { customBlur } from "@/app/fonts";
import { Tag } from "@/components/ui/tag";
import { Heading } from "@/components/ui/heading";
import { Select, SelectOption } from "@/components/ui/select";
import {
    getCategoriesByAccountType,
    getSubCategoriesByAccountType,
} from "@/components/network/data";
import { User } from "@/types/User";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Text } from "@/components/ui/text";

type ProfileData = User["profileData"];

// As competencias principais (coreSkills) sao a Categoria do perfil, e saem
// da lista de categorias do tipo de conta.
export const getCoreSkillOptions = (profileData?: ProfileData): SelectOption[] =>
    getCategoriesByAccountType(profileData?.accountType);

// Esta seccao guarda profileData.skills, que e a Sub-categoria com que a
// pesquisa da rede compara. Um perfil de empresa escolhe entre as
// sub-categorias do seu tipo; profissionais nao tem nivel abaixo da
// profissao, por isso continuam a escolher entre as proprias categorias.
export const getSkillOptions = (profileData?: ProfileData): SelectOption[] => {
    const subCategories = getSubCategoriesByAccountType(profileData?.accountType);

    return subCategories.length > 0
        ? subCategories
        : getCategoriesByAccountType(profileData?.accountType);
};

type SectionEditSkillsProps = {
    isAuthenticated?: boolean;
    /** Ja nao ha modo de edicao: mantidos so por compatibilidade com quem chama. */
    isEditingSkils?: boolean;
    setIsEditingSkils?: Dispatch<SetStateAction<boolean>>;
    profileData?: ProfileData;
    skills?: string[];
    isSaving?: boolean;
    onSaveSkills?: (skills: string[]) => void | Promise<void>;
}

/**
 * Sem passo "Editar": o dono do perfil escolhe uma competencia e ela fica
 * gravada logo; o "x" de uma tag remove-a e grava tambem.
 */
export const SectionEditSkills: React.FC<SectionEditSkillsProps> = ({
    isAuthenticated,
    profileData,
    skills = [],
    isSaving = false,
    onSaveSkills,
}) => {
    const skillOptions = useMemo(
        () => getSkillOptions(profileData).filter(
            (option) => !skills.includes(option.label) && !skills.includes(option.value),
        ),
        [profileData, skills],
    );

    const removeSkill = (skill: string) => {
        if (isSaving) return;

        void onSaveSkills?.(skills.filter((item) => item !== skill));
    };

    const addSkill = (value: string) => {
        const selectedOption = skillOptions.find((option) => option.value === value);
        const skill = selectedOption?.label ?? value;

        if (isSaving || !skill || skills.includes(skill)) return;

        void onSaveSkills?.([...skills, skill]);
    };

    return (
        <div className="w-1/2 flex flex-col h-auto">
            <div className="flex items-center gap-4">
                <Heading className={`${customBlur.className} text-[48px] leading-12`}>
                    Competências
                </Heading>
            </div>

            <div className="w-full flex flex-col gap-4">
                <div className="flex flex-wrap gap-2.5 pt-5 pb-5 border-b border-b-white/900">
                    {skills.length > 0 ? skills.map((skill) => (
                        <Tag key={skill} className="flex gap-1 items-center">
                            {skill}
                            {isAuthenticated && (
                                <button
                                    type="button"
                                    aria-label={`Remover ${skill}`}
                                    disabled={isSaving}
                                    onClick={() => removeSkill(skill)}
                                    className="inline-flex cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <X width={12} height={12} color="#ffffff" />
                                </button>
                            )}
                        </Tag>
                    )) :
                        <Text className="text-[14px] leading-relaxed font-medium">
                            Ainda não existem competências.
                        </Text>
                    }
                </div>

                {isAuthenticated && (
                    <Select
                        variant="secondary"
                        value=""
                        placeholder={isSaving ? "A guardar..." : "Adicionar competência"}
                        options={skillOptions}
                        disabled={isSaving}
                        triggerClassName="border-[1.3px] border-white px-3 text-rede-white outline-none"
                        popoverClassName="rounded-[8px] border-[1.3px] border-white px-3 text-rede-white outline-none mt-[10px]"
                        satelliteClassName="border-[1.3px] border-white"
                        onChange={addSkill}
                    />
                )}
            </div>
        </div>
    );
};
