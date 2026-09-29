"use client";

import Image from "next/image";

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

/** Zona de um PNG que tem conteúdo, em píxeis da imagem original. */
type Crop = { x: number; y: number; width: number; height: number };

type WordmarkPart = {
  src: string;
  /** Tamanho real do PNG. */
  imageWidth: number;
  imageHeight: number;
  crop: Crop;
};

/**
 * Um logótipo que chega em vários PNG que se completam (ex: "PALOP-TL" + "UE").
 * Cada parte é recortada à zona com conteúdo e as partes ficam lado a lado
 * numa só caixa, alinhadas pela mesma linha de base.
 */
type Wordmark = {
  alt: string;
  parts: WordmarkPart[];
};

type PartnerLogo = Logo | Wordmark;

type PartnerGroupData = {
  title: string;
  align?: "left" | "right";
  logos: PartnerLogo[];
};

type PartnerRow = {
  left: PartnerGroupData;
  right?: PartnerGroupData;
};

const PARTNER_ROWS: PartnerRow[] = [
  {
    left: {
      title: "UMA INICIATIVA",
      logos: [
        {
          src: "/assets/partners/museu-cinema.png",
          alt: "Museu do Cinema",
        },
      ],
    },
    right: {
      title: "PARCEIROS DE IMPLEMENTAÇÃO",
      align: "right",
      logos: [
        {
          src: "/assets/partners/ekran-eventos.png",
          alt: "Ekran Eventos",
        },
        {
          src: "/assets/partners/paralax.png",
          alt: "Paralax",
        },
        {
          src: "/assets/partners/tela-digital.png",
          alt: "Tela Digital",
        },
      ],
    },
  },
  {
    left: {
      title: "FINANCIADO PELA COOPERAÇÃO PORTUGUESA — CAMÕES, I.P.",
      logos: [
        {
          src: "/assets/partners/camoes.png",
          alt: "Camões — Instituto da Cooperação e da Língua, I.P.",
        },
      ],
    },
    right: {
      title: "PARCEIROS INSTITUCIONAIS",
      align: "right",
      logos: [
        {
          src: "/assets/partners/inic.png",
          alt: "INIC",
        },
        {
          src: "/assets/partners/ministerio-da-cultura.png",
          alt: "Ministério da Cultura",
        },
      ],
    },
  },
  {
    left: {
      title: "OUTROS APOIOS FINANCEIROS",
      logos: [
        {
          src: "/assets/partners/cultivarte.png",
          alt: "Cultiv'Arte",
        },
        {
          src: "/assets/partners/ministerio-da-educacao.png",
          alt: "Ministério da Educação",
        },
        {
          src: "/assets/partners/uniao.png",
          alt: "União Europeia",
        },
        {
          src: "/assets/partners/expertise-france.png",
          alt: "Expertise France",
        },
      ],
    },
  },
  {
    left: {
      title: "FASES ANTERIORES DESTE PROJECTO TIVERAM APOIO FINANCEIRO",
      logos: [
        {
          src: "/assets/partners/uniao-europeia.png",
          alt: "União Europeia",
        },
        // "PALOP-TL UE" lê-se como um só logótipo, mas vem em dois PNG com o
        // mesmo tamanho e a mesma altura de letra. O mesmo recorte vertical
        // mantém a linha de base; a margem transparente que fica à direita do
        // primeiro e à esquerda do segundo faz de espaço entre as palavras.
        {
          alt: "PALOP-TL UE",
          parts: [
            {
              src: "/assets/partners/palop-tl.png",
              imageWidth: 1528,
              imageHeight: 1080,
              crop: { x: 255, y: 394, width: 1273, height: 307 },
            },
            {
              src: "/assets/partners/ue.png",
              imageWidth: 1528,
              imageHeight: 1080,
              crop: { x: 0, y: 394, width: 326, height: 307 },
            },
          ],
        },
      ],
    },
    right: {
      title: "IMPLEMENTADO COM O APOIO DA EMBAIXADA DE FRANÇA EM MOÇAMBIQUE",
      align: "right",
      logos: [
        {
          src: "/assets/partners/ccfm.png",
          alt: "Centro Cultural Franco-Moçambicano",
        },
        {
          src: "/assets/partners/france-2.png",
          alt: "França",
        },
      ],
    },
  },
];

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

function WordmarkPartImage({ src, imageWidth, imageHeight, crop }: WordmarkPart) {
  // A caixa tem as proporções do recorte; a imagem inteira é escalada e
  // deslocada em percentagens da caixa, para o recorte a preencher.
  return (
    <div
      className="relative h-full shrink-0 overflow-hidden"
      style={{ aspectRatio: `${crop.width} / ${crop.height}` }}
    >
      <Image
        src={src}
        width={imageWidth}
        height={imageHeight}
        alt=""
        className="absolute max-w-none"
        style={{
          width: `${(imageWidth / crop.width) * 100}%`,
          height: `${(imageHeight / crop.height) * 100}%`,
          left: `${(-crop.x / crop.width) * 100}%`,
          top: `${(-crop.y / crop.height) * 100}%`,
        }}
      />
    </div>
  );
}

function WordmarkBox({ alt, parts }: Wordmark) {
  return (
    // Mesma altura das outras caixas; o texto ocupa a mesma fracção da
    // altura que ocupava quando cada PNG tinha a sua caixa.
    <div role="img" aria-label={alt} className="flex h-28 shrink-0 items-center sm:h-32 lg:h-37.5">
      <div className="flex h-[27%]">
        {parts.map((part) => (
          <WordmarkPartImage key={part.src} {...part} />
        ))}
      </div>
    </div>
  );
}

const isWordmark = (logo: PartnerLogo): logo is Wordmark => "parts" in logo;

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
        {logos.map((logo, index) =>
          isWordmark(logo) ? (
            <WordmarkBox key={logo.alt} {...logo} />
          ) : (
            <LogoBox key={`${logo.src}-${index}`} {...logo} />
          ),
        )}
      </div>
    </div>
  );
}


export function Partners() {
  return (
    <section className="bg-rede-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 sm:px-6 lg:gap-6 xl:px-0">
        {PARTNER_ROWS.map((row) => (
          <div
            key={row.left.title}
            className="flex w-full flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-4"
          >
            <PartnerGroup {...row.left} />

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