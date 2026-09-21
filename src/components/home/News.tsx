"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { customBlur } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

import { getPublishedNews } from "@/actions/news";
import { usePublicContent } from "@/hooks/usePublicContent";

import { ArticleCard } from "../ArticleCard";
import { ContentState } from "../ContentState";

export const News: React.FC = () => {
  const { data: news, isLoading, error, retry } = usePublicContent(getPublishedNews);

  return (
    <section className="w-full bg-rede-surface">
      <div className="mx-auto flex w-full max-w-360 flex-col px-4 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 lg:pt-28">
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Heading
            className={`${customBlur.className} text-6xl leading-none font-medium text-rede-yellow sm:text-7xl md:text-8xl lg:text-[96px]`}
          >
            Notícias
          </Heading>

          <Link href="/news" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              icon={<ArrowRight aria-hidden="true" className="h-3 w-3" />}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Ver todas
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {isLoading ? (
            <ContentState variant="loading" message="A carregar notícias…" className="text-rede-white" />
          ) : error ? (
            <ContentState variant="error" message={error} onRetry={retry} />
          ) : !news || news.length === 0 ? (
            <ContentState variant="empty" message="Ainda não há notícias publicadas." className="text-rede-white" />
          ) : (
            news.slice(0, 3).map((item) => (
              <ArticleCard key={item.id} newsData={item} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};