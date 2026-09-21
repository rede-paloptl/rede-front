"use client";

import { customBlur } from "@/app/fonts";
import { Heading } from "@/components/ui/heading";
import { getPublishedNews } from "@/actions/news";
import { usePublicContent } from "@/hooks/usePublicContent";
import { ArticleCard } from "../ArticleCard";
import { ContentState } from "../ContentState";


export const AssociatedNews: React.FC = () => {
    const { data: news, isLoading, error, retry } = usePublicContent(getPublishedNews);


    return (
        <section className="w-full h-auto bg-rede-bg">
            <div className="relative w-full max-w-360 h-auto mx-auto flex flex-col justify-center items-center gap-2.5 pt-28 pb-10">

                <div className="w-full h-36">
                    <Heading className={`${customBlur.className} text-rede-white text-[48px] font-medium leading-12`}>Notícias relacionadas</Heading>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        <ContentState variant="loading" message="A carregar notícias…" className="text-rede-white" />
                    ) : error ? (
                        <ContentState variant="error" message={error} onRetry={retry} />
                    ) : !news || news.length === 0 ? (
                        <ContentState variant="empty" message="Ainda não há notícias publicadas." className="text-rede-white" />
                    ) : (
                        news.slice(0, 3).map((item) => (
                            <ArticleCard newsData={item} key={item.id} />
                        ))
                    )}
                </div>

            </div>
        </section>
    );
}

