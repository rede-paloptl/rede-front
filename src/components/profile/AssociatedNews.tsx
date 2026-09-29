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
            <div className="relative w-full max-w-360 h-auto mx-auto flex flex-col justify-center items-center gap-2.5 px-4 pt-28 pb-10 sm:px-6 lg:px-0">

                <div className="w-full h-36">
                    <Heading className={`${customBlur.className} text-rede-white text-[48px] font-medium leading-12`}>Notícias relacionadas</Heading>
                </div>

                {/* Largura total e colunas fixas: cada cartao ocupa sempre um terco
                    da linha, mesmo quando so existe uma noticia. */}
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        <ContentState variant="loading" message="A carregar notícias…" className="col-span-full text-rede-white" />
                    ) : error ? (
                        <ContentState variant="error" message={error} onRetry={retry} className="col-span-full" />
                    ) : !news || news.length === 0 ? (
                        <ContentState variant="empty" message="Ainda não há notícias publicadas." className="col-span-full text-rede-white" />
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

