'use client'

import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import { ArrowRight } from "lucide-react";
import Card from "./ui/card";
import Link from "next/link";
import { Tag } from "./ui/tag";
import { toLocationLabels } from "./news/actions";
import { getNewsTagHref } from "./news/useNewsFilters";
import { useSiteSettings } from "@/components/contexts/SiteSettingsContext";


type ArticleCardType = {
    newsData: {
        id?: string;
        imageUrl?: string;
        title?: string;
        description?: string;
        date?: string;
        location?: string[] | string;
    }
}

export const ArticleCard: React.FC<ArticleCardType> = ({ newsData }) => {
    const { placeholders } = useSiteSettings();
    return (
        <Card image={
            <Link href={"/news-details?id=" + newsData?.id} className="cursor-pointer">
                <img src={newsData?.imageUrl || placeholders.newsImageUrl} className="w-full h-full object-cover" alt="Diretora no set de filmagem" />
            </Link>
        }
            footer={
                <div className="w-full h-12 flex items-center justify-between gap-4 mt-2">
                    <span className="text-[12px] leading-4 font-medium">
                        {newsData?.date}
                    </span>

                    <Link href={"/news-details?id=" + newsData?.id} className="cursor-pointer">
                        <Button showMainButton={false} iconPosition="right" icon={<ArrowRight width={12} height={12} />} />
                    </Link>
                </div>
            }
            v={"v1"}>

            <div className="w-full h-auto flex flex-col gap-2">
                <div className="w-full h-auto flex flex-wrap gap-2 text-xs font-medium">
                    {toLocationLabels(newsData?.location).map((loc) => (
                        <Tag key={loc} label={loc} href={getNewsTagHref(loc)} />
                    ))}
                </div>

                <div className="w-full h-auto">
                    <Heading level={"h3"} className="text-[20px] font-semibold leading-7 mt-1">
                        {newsData?.title}
                    </Heading>
                </div>

                <Text className="text-[14px] leading-relaxed font-medium line-clamp-2">
                    {newsData?.description}
                </Text>
            </div>
        </Card>
    );
};

