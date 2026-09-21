"use client";

import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Text } from "./ui/text";

type ContentStateProps = {
  variant: "loading" | "empty" | "error";
  message: string;
  onRetry?: () => void;
  className?: string;
};

/**
 * Estados de carregamento, vazio e erro das listagens publicas. Usa o mesmo
 * bloco centrado que as listagens ja tinham para "sem resultados".
 */
export const ContentState: React.FC<ContentStateProps> = ({ variant, message, onRetry, className }) => {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "col-span-full flex min-h-56 w-full flex-col items-center justify-center gap-4 px-4 pb-6 text-center",
        className,
      )}
    >
      {variant === "loading" && (
        <LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin text-rede-yellow" />
      )}

      <Text className={cn("text-[14px] leading-5", variant === "error" ? "text-rede-red" : "text-current")}>
        {message}
      </Text>

      {variant === "error" && onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
};
