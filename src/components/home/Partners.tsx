"use client";

import Image from "next/image";

import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";
import type { PartnerGroup as PartnerGroupSettings, PartnerLogo } from "@/types/SiteSettings";

import { Text } from "../ui/text";

const LOGO_SIZE = {
  width: 200,
  height: 100,
} as const;

type Logo = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

type PartnerGroupData = {
  title: string;
  align?: "left" | "right";
  logos: PartnerLogo[];
};

type PartnerRow = {
  id: string;
  left?: PartnerGroupData;
  right?: PartnerGroupData;
};

/**
 * Os grupos vêm do painel (Personalizar > Parceiros) por ordem. Um grupo
 * "right" junta-se ao grupo "left" imediatamente antes, na mesma linha.
 */
function toRows(groups: PartnerGroupSettings[]): PartnerRow[] {
  const rows: PartnerRow[] = [];

  for (const group of groups) {
    if (group.logos.length === 0) continue;

    const data: PartnerGroupData = { title: group.title, align: group.side, logos: group.logos };
    const last = rows.at(-1);

    if (group.side === "right" && last && !last.right) {
      last.right = data;
    } else {
      rows.push(group.side === "right" ? { id: group.id, right: data } : { id: group.id, left: data });
    }
  }

  return rows;
}

function LogoBox({
  src,
  alt = "",
  width,
  height,
  className = "",
}: Logo) {
  const logoWidth = width ?? LOGO_SIZE.width;
  const logoHeight = height ?? LOGO_SIZE.height;

  return (
    <div
      className={`h-28 max-w-full shrink-0 sm:h-32 lg:h-37.5 ${className}`}
      style={{ width: logoWidth }}
    >
      <Image
        src={src}
        width={logoWidth}
        height={logoHeight}
        alt={alt}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function PartnerGroup({
  title,
  align = "left",
  logos,
}: PartnerGroupData) {
  return (
    <div className="flex w-full min-w-0 flex-col lg:w-auto">
      <Text
        className={`text-xs leading-4 font-medium text-rede-surface ${align === "right" ? "text-left lg:text-right" : "text-left"
          }`}
      >
        {title}
      </Text>

      <div
        className={`flex h-auto w-full flex-wrap gap-1 lg:h-37.5 lg:w-auto lg:flex-nowrap ${align === "right" ? "lg:justify-end" : "justify-start"
          }`}
      >
        {logos.map((logo) => (
          <LogoBox key={logo.id} src={logo.imageUrl} alt={logo.alt} />
        ))}
      </div>
    </div>
  );
}


export function Partners() {
  const { partners } = useSiteSettings();
  const rows = toRows(partners.groups);

  return (
    <section className="bg-rede-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 sm:px-6 lg:gap-6 xl:px-0">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex w-full flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-4"
          >
            {row.left ? <PartnerGroup {...row.left} /> : <div aria-hidden="true" />}

            {row.right && <PartnerGroup {...row.right} />}
          </div>
        ))}
      </div>
        <br/>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-4 sm:px-6 lg:gap-6 xl:px-0">
        <Text className="text-[12px] text-rede-surface text-center font-semibold">DECLARAÇÕES DE RESPONSABILIDADE</Text>
        <Text className="text-[12px] text-rede-surface text-center">

          
          Esta plataforma foi produzida pela AAMCM - Associação dos Amigos do Museu do Cinema em Moçambique e seus parceiros de implementação, para a iniciativa REDE de Cinema e Audiovisual PALOP+TL, com apoio financeiro do Camões - Instituto da Cooperação e da Língua, I.P., através do programa PROCERIS. Todas as informações e opiniões aqui expressas são da inteira responsabilidade dos/as autores/as, e não representam a posição do Camões, I.P.
        </Text>

        <Text className="text-[12px] text-rede-surface text-center">
          Esta plataforma teve  apoio adicional do Cultiv&apos;arte - financiado pela União Europeia, implementado pela Expertise France em parceria com o Ministério da Educação e Cultura de Moçambique. O seu conteúdo é da exclusiva responsabilidade do Beneficiário e não pode, de forma alguma, ser considerado como refletindo as opiniões da Expertise France e do Doador.
        </Text>
      </div>
    </section>
  );
}