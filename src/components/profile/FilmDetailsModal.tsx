"use client";

import { ArrowRight } from "lucide-react";
import { openExternalUrl, toExternalUrl } from "@/lib/utils";
import { ProfileAchievement, ProfileFilm } from "@/types/User";
import { getFilmTagLabel } from "@/components/network/data";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";

type FilmDetailsModalProps = {
  film: ProfileFilm | null;
  /** Todas as entradas do perfil; o modal mostra so as associadas ao filme. */
  achievements?: ProfileAchievement[];
  onClose: () => void;
};

/**
 * Detalhe de um filme ao clicar no cartao, com os festivais, premios e
 * exibicoes associados. Segue o mesmo modal lateral da equipa (TeamSection).
 */
export const FilmDetailsModal: React.FC<FilmDetailsModalProps> = ({ film, achievements = [], onClose }) => {
  const relatedAchievements = film
    ? achievements.filter((entry) => entry.filmId === film.id)
    : [];
  const filmUrl = toExternalUrl(film?.link);

  return (
    <Modal
      open={Boolean(film)}
      onClose={onClose}
      className="items-start justify-end bg-rede-surface/70 p-4 sm:px-13 sm:py-10"
      wrapperClassName="h-full w-full max-w-[680px] motion-safe:animate-[filmModalSlideIn_280ms_cubic-bezier(0.22,1,0.36,1)]"
      panelClassName="h-full max-h-[calc(100vh-2rem)] w-full max-w-[680px] overflow-y-auto rounded-none border-[1.3px] border-white/90 bg-rede-surface p-0 sm:max-h-[calc(100vh-5rem)]"
      closeButtonClassName="!left-auto !right-4 !top-4 !ml-0 !border-0 !bg-rede-surface !text-rede-white hover:!bg-rede-white hover:!text-rede-surface sm:!right-full sm:!top-6"
    >
      {film && (
        <div className="relative min-h-full bg-rede-surface px-5 pb-18 pt-18 text-rede-white sm:px-5 sm:pb-24 sm:pt-5">
          <p className="absolute -top-7 left-0 hidden text-[12px] leading-4 text-rede-bg-200 sm:block">
            Filme
          </p>

          <div className="h-[260px] w-full overflow-hidden bg-rede-bg-600 sm:h-[320px]">
            <img
              src={film.cover || "/assets/placeholder-img.jpg"}
              alt={`Capa de ${film.title}`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <h3 className="text-[20px] font-semibold leading-7 text-rede-white">
              {film.title}
            </h3>

            <p className="text-[12px] font-medium leading-4 text-rede-white/80">
              {[film.year, film.duration].filter(Boolean).join(", ")}
            </p>

            <div className="flex flex-wrap gap-2">
              {[...film.countries, ...film.type, ...(film.roles ?? [])].map((value, index) => (
                <Tag
                  key={`${value}-${index}`}
                  className="inline-flex w-auto shrink-0 whitespace-nowrap border-rede-white/35 text-rede-white"
                  variant="card"
                  interactive={false}
                >
                  {getFilmTagLabel(value)}
                </Tag>
              ))}
            </div>

          </div>

          <div className="mt-10 border-t-[1.3px] border-rede-white/20 pt-6">
            <Text className="text-[16px] font-semibold leading-6">
              Festivais, Prémios e Exibições
            </Text>

            {relatedAchievements.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-4">
                {relatedAchievements.map((entry) => (
                  <li key={entry.id} className="border-b border-rede-white/20 pb-4">
                    <span className="text-xs leading-4 text-rede-white/80">{entry.type}</span>
                    {entry.link ? (
                      <a
                        href={toExternalUrl(entry.link)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-words text-[16px] font-semibold leading-6 underline-offset-2 hover:underline"
                      >
                        {entry.title}
                      </a>
                    ) : (
                      <Text className="mt-1 break-words text-[16px] font-semibold leading-6">
                        {entry.title}
                      </Text>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Text className="mt-3 text-[14px] leading-relaxed font-medium text-rede-white/70">
                Ainda não existem festivais, prémios ou exibições associados a este filme.
              </Text>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>

            {filmUrl && (
              <Button
                variant="primary"
                icon={<ArrowRight width={12} height={12} aria-hidden="true" />}
                iconPosition="right"
                onClick={() => openExternalUrl(filmUrl)}
              >
                Ver filme
              </Button>
            )}
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes filmModalSlideIn {
          from {
            opacity: 0;
            transform: translateX(72px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Modal>
  );
};
