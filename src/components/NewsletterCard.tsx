'use client'

import { useState } from "react";
import Card from "./ui/card";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { ArrowRight } from "lucide-react";
import { formatMonthOfYear } from "@/lib/dates";



/** Edição publicada da newsletter, como a API pública a devolve. */
export type NewsletterType = {
    id?: string;
    imageUrl?: string;
    title?: string;
    description?: string;
    /** ISO (yyyy-mm-dd). */
    date?: string;
    location?: string;
    /** PDF ou página com a edição completa. */
    link?: string;
}

/** "Edição de Fevereiro" -> "edicao-de-fevereiro.pdf" */
const getPdfFilename = (title?: string) => {
    const slug = (title ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${slug || "newsletter"}.pdf`;
};

type NewsletterCardType = {
    newsletterData: NewsletterType
}

export const NewsletterCard: React.FC<NewsletterCardType> = ({ newsletterData }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    // O PDF vive noutro dominio (R2), onde o atributo `download` e ignorado:
    // descarrega-se como blob. Se o pedido falhar (CORS, link externo que nao
    // e PDF), abre a edicao num novo separador como antes.
    const downloadEdition = async () => {
        const link = newsletterData?.link;
        if (!link || isDownloading) return;

        setIsDownloading(true);

        try {
            const response = await fetch(link);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            if (!blob.type.includes("pdf")) throw new Error("Not a PDF");

            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = getPdfFilename(newsletterData?.title);
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch {
            window.open(link, "_blank", "noopener,noreferrer");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card image={
        <img
            src={newsletterData?.imageUrl || "/assets/newsletter.png"}
            className="w-full h-full object-cover" alt="Diretora no set de filmagem" />
        }
            footer={
                <div className="w-full flex items-end justify-between gap-4 mt-2">
                    <Text as="span" className="text-[12px] leading-4 font-medium">
                        {formatMonthOfYear(newsletterData?.date)}
                    </Text>

                    <Button
                        showMainButton={false}
                        iconPosition="right"
                        icon={<ArrowRight width={12} height={12} />}
                        onClick={() => void downloadEdition()}
                        disabled={!newsletterData?.link || isDownloading}
                        aria-label="Descarregar edição em PDF"
                    />
                </div>
            }
            v={"v1"}
        >

            <Heading level={"h3"} className="text-[20px] font-semibold leading-7 mt-1">
                {newsletterData?.title}
            </Heading>
        </Card>
    );
};
