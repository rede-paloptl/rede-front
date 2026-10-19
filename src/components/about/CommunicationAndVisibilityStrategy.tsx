"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import { customBlur } from "@/app/fonts";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";

export const CommunicationAndVisibilityStrategy: React.FC = () => {
  const { about } = useSiteSettings();
  return (
    <section className="h-auto w-full bg-rede-bg">
      <div className="relative mx-auto flex h-auto min-h-30 w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:flex-row lg:gap-0 lg:px-0 lg:pb-20 lg:pt-20">
        <div className="flex h-auto w-full flex-col gap-5 lg:w-1/2">
          <Heading
            className={`${customBlur.className} text-[52px] font-medium leading-[56px] text-rede-yellow sm:text-[72px] sm:leading-[76px] lg:text-[96px] lg:leading-[96px]`}
          >
            Estratégia de Comunicação e Visibilidade
          </Heading>

          <Text className="text-[14px] leading-relaxed font-medium">
            A REDE de Cinema e Audiovisual PALOP+TL surge como uma plataforma
            estratégica de cooperação cultural e profissional, dedicada à
            valorização, à circulação e à internacionalização do cinema e do
            audiovisual produzidos nos Países Africanos de Língua Oficial
            Portuguesa e em Timor-Leste. Num contexto global em que as
            cinematografias africanas e do Sul Global ganham uma relevância
            crescente, a REDE posiciona-se também como uma plataforma de
            visibilidade internacional.
          </Text>

          <Text className="text-[14px] leading-relaxed font-medium">
            Nesse sentido, a nossa Estratégia de Comunicação define o caminho
            para fortalecer a identidade, a visibilidade e a capacidade do
            cinema dos PALOP e de Timor-Leste, posicionando a REDE como uma
            plataforma unificadora e representativa do cinema destes países.
          </Text>


          <Link href={about.strategyPdfUrl} target="_blank" rel="noopener noreferrer">
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

        <div className="h-auto w-full lg:w-1/2">
          <div className="relative mx-auto aspect-[448/544] w-full max-w-[448px] lg:mt-10 lg:h-[544px] lg:w-[448px]">
            <Image
              src="/assets/about/waves.svg"
              alt="Representação gráfica da Estratégia de Comunicação e Visibilidade"
              fill
              sizes="(max-width: 1023px) 100vw, 448px"
              className="object-contain lg:object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};