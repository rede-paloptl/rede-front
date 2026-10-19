"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import { customBlur } from "@/app/fonts";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";

export const GovernanceFrameworkSection: React.FC = () => {
  const { about } = useSiteSettings();
  return (
    <section className="h-auto w-full bg-rede-surface">
      <div className="relative mx-auto flex h-auto min-h-30 w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:flex-row lg:gap-0 lg:px-0 lg:pb-20 lg:pt-20">
        <div className="order-2 h-auto w-full lg:order-1 lg:w-1/2">
          <div className="relative mx-auto aspect-[448/544] w-full max-w-[448px] lg:mt-10 lg:h-[544px] lg:w-[448px]">
            <Image
              src="/assets/about/squares.svg"
              alt="Representação gráfica do Quadro de Governação Digital"
              fill
              sizes="(max-width: 1023px) 100vw, 448px"
              className="object-contain lg:object-cover"
            />
          </div>
        </div>

        <div className="order-1 flex h-auto w-full flex-col gap-5 lg:order-2 lg:w-1/2">
          <Heading
            className={`${customBlur.className} text-[52px] font-medium leading-[56px] text-rede-yellow sm:text-[72px] sm:leading-[76px] lg:text-[96px] lg:leading-[96px]`}
          >
            Quadro de Governação Digital
          </Heading>

          <Text className="text-[14px] leading-relaxed font-medium">
            A REDE de Cinema e Audiovisual PALOP+TL é uma plataforma regional
            dedicada ao fortalecimento, à valorização e à promoção dos
            ecossistemas cinematográficos e audiovisuais dos países
            participantes. Num contexto marcado pela diversidade cultural,
            linguística, histórica e tecnológica, a REDE assume a missão de
            aproximar profissionais, organizações, instituições culturais e
            parceiros, promovendo:
          </Text>

          <ul className="ml-6 mt-2 list-disc space-y-1 text-[14px] leading-relaxed font-medium">
            <li className="pl-1 lg:indent-2.5">
              A circulação de conhecimento;
            </li>
            <li className="pl-1 lg:indent-2.5">
              A criação de oportunidades;
            </li>
            <li className="pl-1 lg:indent-2.5">
              A cooperação profissional;
            </li>
            <li className="pl-1 lg:indent-2.5">
              A valorização da produção audiovisual.
            </li>
          </ul>

          <Text className="text-[14px] leading-relaxed font-medium">
            A dimensão digital da REDE não é entendida apenas como uma
            ferramenta tecnológica, mas também como uma infraestrutura de
            colaboração, documentação e construção de conhecimento coletivo.
            Por essa razão, a REDE estabelece o presente Quadro de Governação
            Digital, que define os princípios, as regras e os compromissos que
            orientam a sua presença digital.
          </Text>

          <Link href={about.governancePdfUrl} target="_blank" rel="noopener noreferrer">
            <Button
              className="w-full sm:max-w-[200px]"
              variant="primary"
              icon={<Eye width={12} height={12} aria-hidden="true" />}
              iconPosition="left"
            >
              Ler documento
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};