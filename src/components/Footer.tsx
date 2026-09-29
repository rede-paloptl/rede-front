"use client";

import Link from "next/link";

import { CustomFacebook } from "@/icons/CustomFacebook";
import { CustomInstagram } from "@/icons/CustomInstagram";
import { CustomYouTube } from "@/icons/CustomYouTube";

import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import { customBlur } from "@/app/fonts";

type FooterProps = {
  variant?: "yellow" | "red";
};

const menuItems = [
  { label: "Sobre nós", href: "/about" },
  { label: "REDE", href: "/network" },
  { label: "Agência", href: "/agency" },
  { label: "Notícias", href: "/news" },
  { label: "Oportunidades", href: "/opportunities" },
  { label: "Workshops", href: "/workshops" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Film Commission", href: "/film-commission" },
] as const;

const contactItems = [
  {
    label: "redecinemapaloptl@gmail.com",
    href: "mailto:redecinemapaloptl@gmail.com",
  },
  {
    label: "+258 849517611",
    href: "tel:+258849517611",
  },
  {
    label: "Termos de utilização",
    href: "/assets/termos-de-utilizacao.pdf",
  },
  {
    label: "Política de privacidade",
    href: "/assets/politica-de-privacidade.pdf",
  },
] as const;

export const Footer: React.FC<FooterProps> = ({
  variant = "yellow",
}) => {
  return (
    <footer className="h-auto w-full bg-rede-surface">
      <div className="mx-auto h-auto w-full max-w-360 px-4 pt-16 pb-8 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28 lg:pb-10 xl:px-0">
        <div className="flex w-full flex-col gap-12 md:flex-row md:gap-6 lg:gap-0">
          <div className="flex h-full w-full flex-row justify-start gap-4 md:flex-col md:justify-center">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              aria-label="Facebook"
              containerClassName="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
              className="h-14 w-14 cursor-pointer rounded-full border-[1.3px] border-white p-0 sm:h-16 sm:w-16"
            >
              <CustomFacebook
                width={64}
                height={64}
                className="hover:text-black"
              />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              aria-label="Instagram"
              containerClassName="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
              className="h-14 w-14 cursor-pointer rounded-full border-[1.3px] border-white p-0 sm:h-16 sm:w-16"
            >
              <CustomInstagram width={64} height={64} />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              aria-label="YouTube"
              containerClassName="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
              className="h-14 w-14 cursor-pointer rounded-full border-[1.3px] border-white p-0 sm:h-16 sm:w-16"
            >
              <CustomYouTube width={64} height={64} />
            </Button>
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
                    <li key={item.href} className="mb-2.5">
                      <Link
                        href={item.href}
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
                  <li key={item.href} className="mb-2.5">
                    <Link
                      href={item.href}
                      target="_blank"
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