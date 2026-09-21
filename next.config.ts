import type { NextConfig } from "next";

// Dominio publico do bucket R2 (ex: https://media.dominio.com). Tem de ter o
// mesmo valor que R2_PUBLIC_URL no rede-back. E lido em build time: mudar na
// Vercel obriga a novo deploy.
const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();
const r2PublicHostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : null;

// Em desenvolvimento a API guarda os uploads no disco e serve-os em
// http://localhost:4001/uploads (STORAGE_DRIVER=local no rede-back).
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  images: {
    // O Next 16 recusa optimizar imagens de enderecos locais por omissao.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      ...(isDev
        ? [{ protocol: 'http' as const, hostname: 'localhost', port: '4001', pathname: '/uploads/**' }]
        : []),
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**', // Wildcard for all subpaths under images
      },
      {
        protocol: 'https',
        hostname: '*.images.unsplash.com', // Wildcard for subdomains
      },
      // Imagens carregadas antes do R2, que continuam gravadas com URL do Supabase.
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.redecinemapaloptl.org'
      },
      ...(r2PublicHostname
        ? [{ protocol: 'https' as const, hostname: r2PublicHostname }]
        : []),
    ],
  },
};

export default nextConfig;
