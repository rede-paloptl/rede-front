"use client";

import { Button } from "../ui/button";
import { Heading } from "../ui/heading";
import { customBlur } from "@/app/fonts";
import { OpportunityType } from "../OpportunityCard";
import { linkify } from "@/actions";
import { formatPeriod } from "@/lib/dates";
import { Link, Mail } from "lucide-react";
import Facebook from "@/icons/Facebook";
import { Text } from "../ui/text";
import { Tag } from "../ui/tag";
import { useState } from "react";
import { getOpportunityTagHref } from "./useOpportunityFilters";

// Os mesmos rotulos e cores do cartao da listagem, para o estado da
// oportunidade ser lido da mesma maneira nos dois sitios.
const statusTags: Record<OpportunityType["status"], { label: string; variant: "statusOpen" | "statusStarting" | "statusExpired" }> = {
    open: { label: "Aberta", variant: "statusOpen" },
    starting: { label: "A iniciar", variant: "statusStarting" },
    expired: { label: "Encerrada", variant: "statusExpired" },
};

export const SectionViewOpportunity: React.FC<{ selectedOpportunity: OpportunityType }> = ({ selectedOpportunity }) => {
    const [copied, setCopied] = useState(false);

    const getCurrentUrl = () => window.location.href;

    const handleCopyLink = async () => {
        const url = getCurrentUrl();

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const input = document.createElement("input");
                input.value = url;
                input.setAttribute("readonly", "");
                input.style.position = "absolute";
                input.style.left = "-9999px";
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                document.body.removeChild(input);
            }

            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Erro ao copiar link:", error);
        }
    };

    const handleShareFacebook = () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCurrentUrl())}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    const handleShareEmail = () => {
        const subject = encodeURIComponent(selectedOpportunity?.title ?? "Oportunidade");
        const body = encodeURIComponent(`${selectedOpportunity?.title ?? "Oportunidade"}\n\n${getCurrentUrl()}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const formatOpportunityDescription = (description: string): string => {
        const paragraphs = description
            .trim()
            .split(/(?:<br\s*\/?>\s*){2,}/gi)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);

        return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
    };

    const status = statusTags[selectedOpportunity?.status];

    return (
        <div className="w-full max-w-350 h-auto mr-auto ml-auto pt-16 pb-16 bg-rede-bg">
            <div className="w-full flex flex-col gap-2 border-b-[1.3px] border-rede-white pb-6">
                <div className="flex flex-wrap items-center gap-2">
                    {status && <Tag label={status.label} variant={status.variant} />}

                    {selectedOpportunity?.eligibility?.map((eligibility: string, index) => (
                        <Tag
                            href={getOpportunityTagHref(eligibility)}
                            label={eligibility}
                            key={eligibility + index}
                        />
                    ))}

                    <Text className="text-[12px] leading-[16px]">
                        {formatPeriod(selectedOpportunity?.startDate, selectedOpportunity?.endDate)}
                    </Text>
                </div>

                <div className="flex flex-wrap gap-2">
                    {selectedOpportunity?.type && (
                        <Tag
                            href={getOpportunityTagHref(selectedOpportunity.type)}
                            label={selectedOpportunity.type}
                        />
                    )}

                    {selectedOpportunity.themes?.map((theme: string, index) => (
                        <Tag href={getOpportunityTagHref(theme)} label={theme} key={theme + index} />
                    ))}
                </div>
            </div>

            <div className="w-full h-auto flex flex-col gap-4 mt-28 pb-10">
                <Heading className={`${customBlur.className} text-[96px] leading-24 font-normal pb-12.5 text-center text-rede-yellow`}>
                    {selectedOpportunity?.title}
                </Heading>

                <div
                    className="
    w-full
    columns-1
    gap-8
    text-[14px]
    font-medium
    leading-relaxed
    text-rede-white

    md:columns-2

    [&_p]:m-0
    [&_p]:break-inside-auto
    [&_p:not(:last-child)]:mb-4

    [&_a]:font-semibold
    [&_a]:text-rede-red
    [&_a]:underline
    hover:[&_a]:opacity-80
  "
                    dangerouslySetInnerHTML={{
                        __html: linkify(
                            formatOpportunityDescription(selectedOpportunity?.description ?? ""),
                        ),
                    }}
                />
            </div>

            <div className="w-full flex gap-2.5 border-t-[1.3px] border-rede-white pt-12.5">
                <Button variant={"secondary"} icon={<Link width={12} height={12} color="white" />} iconPosition="left" onClick={handleCopyLink}>
                    {copied ? "Copiado!" : "Copiar link"}
                </Button>
                <Button variant={"secondary"} icon={<Facebook width={12} height={12} color="white" />} iconPosition="left" onClick={handleShareFacebook}>
                    Facebook
                </Button>
                <Button variant={"secondary"} icon={<Mail width={12} height={12} color="white" />} iconPosition="left" onClick={handleShareEmail}>
                    E-mail
                </Button>
            </div>
        </div>
    )
}


