"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import { customBlur } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/Input";
import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const { home } = useSiteSettings();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      return;
    }

    setEmail(normalizedEmail);
  };

  return (
    <section className="w-full bg-rede-bg">
      <div className="relative mx-auto min-h-[420px] w-full max-w-[1920px] overflow-hidden sm:min-h-[480px] lg:min-h-[520px]">
        <Image
          src={home.newsletterImageUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/45"
        />

        <div className="relative z-10 mx-auto flex min-h-[420px] w-full max-w-360 flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:min-h-[480px] sm:px-6 lg:min-h-[520px] lg:px-8">
          <Heading
            className={`${customBlur.className} break-words text-6xl leading-none font-medium text-rede-white sm:text-7xl md:text-8xl lg:text-[96px]`}
          >
            Newsletter
          </Heading>

          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Endereço de e-mail
            </label>

            <Input
              id="newsletter-email"
              name="email"
              type="email"
              variant="secondary"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="O seu e-mail"
              autoComplete="email"
              inputMode="email"
              required
              className="w-full bg-transparent placeholder:text-[#dddddd]"
            />

            <Button type="submit" className="w-full shrink-0 sm:w-auto">
              Subscrever
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};