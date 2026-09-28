"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  History,
  Languages,
  LogIn,
  LogOut,
  Menu,
  User2,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

import CustomImage from "./CustomImage";
import { Button } from "./ui/button";

const menuItems = [
  { label: "Sobre nós", href: "/about" },
  { label: "REDE", href: "/network" },
  { label: "Agência", href: "/agency" },
  { label: "Notícias", href: "/news" },
  { label: "Oportunidades", href: "/opportunities" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Film Commission", href: "/film-commission" },
] as const;

export const TopBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const avatarUrl =
    user?.profileData?.imageUrl ?? user?.imageUrl ?? user?.avatarUrl;

  const profession =
  user?.profileData?.coreSkills?.join(" | ") ?? user?.coreSkills?.join(" | ") ?? "";


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await signOut("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b-[1.3px] border-rede-white bg-rede-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Ir para a página inicial"
          className="h-16 w-32 shrink-0 sm:w-40"
        >
          <Image
            src="/assets/logo-small.png"
            alt="Logótipo da REDE"
            width={183}
            height={64}
            className="h-full w-full object-contain object-left"
            priority
          />
        </Link>

        <nav aria-label="Navegação principal" className="hidden xl:block">
          <ul className="flex items-center gap-1 text-rede-white">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    isActive={isActiveRoute(item.href)}
                    variant="secondary"
                    size="sm"
                    className="border-none whitespace-nowrap"
                  >
                    {item.label}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-controls="desktop-user-menu"
                onClick={() => setIsUserMenuOpen((current) => !current)}
                className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-rede-yellow"
              >
                <CustomImage
                  src={avatarUrl}
                  fallbackSrc="/assets/avatar.png"
                  alt={`Fotografia de perfil de ${user.name}`}
                  height={40}
                  width={40}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                <div className="max-w-40 text-left">
                  <p className="truncate text-sm font-medium text-rede-white">
                    {user.name}
                  </p>

                  {profession && (
                    <p className="truncate text-xs text-rede-gray">
                      {profession}
                    </p>
                  )}
                </div>

                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 text-rede-gray transition-transform duration-200",
                    isUserMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {isUserMenuOpen && (
                <div
                  id="desktop-user-menu"
                  role="menu"
                  className="absolute right-0 top-full mt-3 w-52 overflow-hidden rounded-xl border border-white/10 bg-rede-surface py-1 shadow-2xl"
                >
                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-rede-white transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
                  >
                    <User2 aria-hidden="true" className="h-4 w-4" />
                    Perfil
                  </Link>

                  <Link
                    href="/historico"
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-rede-white transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
                  >
                    <History aria-hidden="true" className="h-4 w-4" />
                    Histórico
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-rede-red transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Terminar sessão
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label="Selecionar idioma"
              >
                PT
              </Button>

              <Link href="/login">
                <Button size="sm">Iniciar sessão</Button>
              </Link>

              <Link href="/signup">
                <Button size="sm">Criar conta</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          {user && (
            <CustomImage
              src={avatarUrl}
              fallbackSrc="/assets/avatar.png"
              alt={`Fotografia de perfil de ${user.name}`}
              height={36}
              width={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          )}

          <button
            type="button"
            aria-label={
              isMobileMenuOpen
                ? "Fechar menu de navegação"
                : "Abrir menu de navegação"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-rede-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rede-yellow"
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-rede-surface transition-all duration-300 xl:hidden",
          isMobileMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0",
        )}
      >
        <nav
          aria-label="Navegação para dispositivos móveis"
          className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 py-6 sm:px-6"
        >
          {user && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <CustomImage
                src={avatarUrl}
                fallbackSrc="/assets/avatar.png"
                alt={`Fotografia de perfil de ${user.name}`}
                height={48}
                width={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0">
                <p className="truncate font-medium text-rede-white">
                  {user.name}
                </p>

                {profession && (
                  <p className="truncate text-sm text-rede-gray">
                    {profession}
                  </p>
                )}
              </div>
            </div>
          )}

          <ul className="flex flex-col">
            {menuItems.map((item) => {
              const active = isActiveRoute(item.href);

              return (
                <li key={item.href} className="border-b border-white/10">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-13 items-center rounded-lg px-3 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-rede-yellow text-rede-surface"
                        : "text-rede-white hover:bg-white/5",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto grid gap-3 pt-8">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-rede-white px-5 py-3 text-sm font-medium text-rede-white transition-colors hover:bg-rede-white hover:text-rede-surface"
                >
                  <User2 aria-hidden="true" className="h-4 w-4" />
                  Ver perfil
                </Link>

                <Link
                  href="/historico"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-rede-white px-5 py-3 text-sm font-medium text-rede-white transition-colors hover:bg-rede-white hover:text-rede-surface"
                >
                  <History aria-hidden="true" className="h-4 w-4" />
                  Histórico de sessões
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rede-red px-5 py-3 text-sm font-medium text-rede-red transition-colors hover:bg-rede-red hover:text-rede-white"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  Terminar sessão
                </button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Languages aria-hidden="true" className="h-4 w-4" />
                  Português
                </Button>

                <Link href="/login" className="w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <LogIn aria-hidden="true" className="h-4 w-4" />
                    Iniciar sessão
                  </Button>
                </Link>

                <Link href="/signup" className="w-full">
                  <Button size="sm" className="w-full">
                    <UserPlus aria-hidden="true" className="h-4 w-4" />
                    Criar conta
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};