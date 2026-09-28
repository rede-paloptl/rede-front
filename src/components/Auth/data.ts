import { SocialNetwork } from "@/types/Profile";

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
