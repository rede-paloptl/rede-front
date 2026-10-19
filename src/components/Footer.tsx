"use client";

import Link from "next/link";

import { CustomFacebook } from "@/icons/CustomFacebook";
import { CustomInstagram } from "@/icons/CustomInstagram";
import { CustomYouTube } from "@/icons/CustomYouTube";

import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";
import { externalLinkProps } from "@/lib/siteSettings";
import type { SocialNetwork } from "@/types/SiteSettings";

import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import { customBlur } from "@/app/fonts";

type FooterProps = {
  variant?: "yellow" | "red";
};

const socialItems: { network: SocialNetwork; label: string; icon: React.ReactNode }[] = [
  {
    network: "facebook",
    label: "Facebook",
    icon: <CustomFacebook width={64} height={64} className="hover:text-black" />,
  },
  {
    network: "instagram",
    label: "Instagram",
    icon: <CustomInstagram width={64} height={64} />,
  },
  {
    network: "youtube",
    label: "YouTube",
    icon: <CustomYouTube width={64} height={64} />,
  },
];

export const Footer: React.FC<FooterProps> = ({
  variant = "yellow",
}) => {
  // Links e redes sociais geridos no painel (Personalizar > Rodapé).
  const { footer } = useSiteSettings();
  const menuItems = footer.menuLinks.filter((item) => item.isVisible);
  const contactItems = footer.contactLinks.filter((item) => item.isVisible);

  return (
    <footer className="h-auto w-full bg-rede-surface">
      <div className="mx-auto h-auto w-full max-w-360 px-4 pt-16 pb-8 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28 lg:pb-10 xl:px-0">
        <div className="flex w-full flex-col gap-12 md:flex-row md:gap-6 lg:gap-0">
          <div className="flex h-full w-full flex-row justify-start gap-4 md:flex-col md:justify-center">
            {socialItems.map(({ network, label, icon }) => {
              const href = footer.social[network];
              const button = (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  aria-label={label}
                  containerClassName="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
                  className="h-14 w-14 cursor-pointer rounded-full border-[1.3px] border-white p-0 sm:h-16 sm:w-16"
                >
                  {icon}
                </Button>
              );

              // Sem link no painel, o ícone fica como estava (sem destino).
              return href ? (
                <Link key={network} href={href} target="_blank" rel="noopener noreferrer" className="w-fit" tabIndex={-1}>
                  {button}
                </Link>
              ) : (
                <div key={network} className="w-fit">{button}</div>
              );
            })}
          </div>

          <div className="flex h-full w-full flex-col justify-center md:items-center">
            <div className="w-fit">
              <Heading
                level="h3"
                className={`${customBlur.className} mb-4 text-left text-[48px] leading-14 font-medium text-rede-white sm:text-[48px] sm:leading-14`}
              >
                Menu
              </Heading>

              <nav aria-label="Navegação do rodapé">
                <ul className="text-left text-sm leading-5 font-medium text-rede-white">
                  {menuItems.map((item) => (
                    <li key={item.id} className="mb-2.5">
                      <Link
                        href={item.href}
                        {...externalLinkProps(item.href)}
                        className="transition-colors hover:text-rede-yellow focus-visible:text-rede-yellow focus-visible:outline-none"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          <div className="flex h-full w-full flex-col gap-4">
            <Heading
              level="h3"
              className={`${customBlur.className} mb-4 text-left text-[48px] leading-14 font-medium text-rede-white sm:text-[48px] sm:leading-14`}
            >
              Contactos
            </Heading>

            <address className="not-italic">
              <ul className="text-sm leading-5 font-medium text-rede-white">
                {contactItems.map((item) => (
                  <li key={item.id} className="mb-2.5">
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words transition-colors hover:text-rede-yellow focus-visible:text-rede-yellow focus-visible:outline-none"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </address>
          </div>
        </div>

        <div className="w-full">
          <div className="mx-auto mt-20 mb-2.5 h-auto w-full max-w-348 sm:mt-28 lg:mt-52.5 lg:h-53.25">
            <img
              src={`/assets/footer/${variant}-logo-footer.svg`}
              alt="Logótipo da REDE"
              className="h-auto w-full object-cover lg:h-full"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;