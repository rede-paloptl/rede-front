"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { customBlur } from "@/app/fonts";
import { getPublishedNews } from "@/actions/news";
import { usePublicContent } from "@/hooks/usePublicContent";
import { ArticleCard } from "../ArticleCard";
import Link from "next/link";


export const WorkShops: React.FC = () => {
    const { data: news } = usePublicContent(getPublishedNews);

    const images = [
        "/assets/home/workshops/shop-1.png",
        "/assets/home/workshops/shop-2.png",
        "/assets/home/workshops/shop-3.png",
    ];


    return (
        <section className="w-full h-auto bg-rede-surface">
            <div className="relative w-full max-w-360 h-auto mx-auto flex flex-col justify-center items-center pt-28 pb-10">

                <div className="w-full h-36">
                    <Heading className={`${customBlur.className} text-rede-yellow text-[96px] font-medium leading-24`}>Workshops</Heading>
                </div>

                <div className="w-full h-auto flex items-center justify-end mb-5">
                    <Button variant={"secondary"} icon={<ArrowRight width={12} height={12} />} iconPosition="right">Ver todas</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(news ?? []).slice(0, 3).map((item) => (
                        <ArticleCard
                            key={item.id}
                            newsData={item}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}

