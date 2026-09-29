import { SocialNetwork } from "@/types/Profile";
import { CompanyType } from "@/types/User";

// País, cidades e serviços vêm das listas geridas no painel (Configurações):
// ver lib/taxonomy.ts.

export const socialFields: { key: SocialNetwork; label: string; placeholder: string }[] = [
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/nome' },
    { key: 'instagram', label: 'Instagram', placeholder: '@nome' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@nome' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/nome' },
    { key: 'tiktok', label: 'TikTok', placeholder: '@nome' },
    { key: 'imdb', label: 'IMDb', placeholder: 'https://imdb.com/name/nm0000000' },
    { key: 'website', label: 'Website', placeholder: 'https://site.com' },
];

// Sub-tipos de uma conta de empresa. Cada um e um tipo de perfil da Rede, com
// as suas proprias competencias (ver network/data.ts).
export const companyTypeOptions: { value: CompanyType; label: string }[] = [
    { value: 'empresa', label: 'Empresa' },
    { value: 'festival', label: 'Festival' },
    { value: 'instituicao', label: 'Instituição' },
];
