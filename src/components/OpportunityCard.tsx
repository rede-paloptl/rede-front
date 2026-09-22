"use client"

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPeriod } from "@/lib/dates";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import Card from "./ui/card";
import { Tag } from "./ui/tag";
import { getOpportunityTagHref } from "./opportunities/useOpportunityFilters";

export type OpportunityType = {
  id: string;
  title: string;
  description: string;
  isAvailable: boolean;
  status: "open" | "starting" | "expired";
  /** Ausente (null) nas oportunidades criadas antes deste campo. */
  format?: "in-person" | "remote" | "hybrid" | null;
  startDate: string;
  endDate: string;
  type: string;
  eligibility: Array<string>,
  themes?: string[];
  country: string;
  cover: string;
  /** Onde o visitante se candidata; sem link o botão não aparece. */
  applyLink?: string | null;
}

export const OpportunityCard: React.FC<{ opportunityData: OpportunityType }> = ({ opportunityData }) => {
  return (
    <Card
      image={
        <Link href={"/opportunity-details?id=" + opportunityData.id} className="cursor-pointer">
          <img src={opportunityData.cover || "/assets/opportunities/hero.jpg"} className="w-full h-full object-cover" alt="Diretora no set de filmagem" />
        </Link>
      }
      footer={
        <div className="w-full h-12 flex items-center justify-between gap-4 mt-2">
          <Text className="text-[12px] leading-relaxed font-medium line-clamp-2">
            {formatPeriod(opportunityData?.startDate, opportunityData?.endDate)}
          </Text>

          <Link href={"/opportunity-details?id=" + opportunityData.id} className="cursor-pointer">
            <Button showMainButton={false} iconPosition="right" icon={<ArrowRight width={12} height={12} />} />
          </Link>
        </div>
      }>

      <div className="flex flex-wrap gap-2.5">
        {opportunityData.status === "open" && (
          <Tag label="Aberta" variant="statusOpen" />
        )}

        {opportunityData.status === "starting" && (
          <Tag label="A iniciar" variant="statusStarting" />
        )}

        {opportunityData.status === "expired" && (
          <Tag label="Encerrada" variant="statusExpired" />
        )}

        {/* <Tag label={`${opportunityData?.startDate} - ${opportunityData.endDate}`} /> */}
        <Tag label={`${opportunityData?.type}`} href={getOpportunityTagHref(opportunityData.type)} />

        {opportunityData.eligibility.map((eligibility: string, index: number) => (
          <Tag href={getOpportunityTagHref(eligibility)} label={eligibility} key={eligibility + "xD" + index} />
        ))}
      </div>

      <Heading level={"h3"} className="text-[20px] font-semibold leading-7 mt-1">
        {opportunityData.title}
      </Heading>

    </Card>
  );
};

