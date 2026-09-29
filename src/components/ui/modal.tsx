"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  panelClassName?: string;
  closeButtonClassName?: string;
  /**
   * Fechar ao clicar fora do painel. Formulários devem passar false: um clique
   * acidental no fundo fazia perder tudo o que já estava preenchido. O botão
   * de fechar e a tecla Escape continuam a funcionar.
   */
  closeOnBackdropClick?: boolean;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  className,
  wrapperClassName,
  panelClassName,
  closeButtonClassName,
  closeOnBackdropClick = true,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6",
        className
      )}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div className={cn("relative w-full max-w-170", wrapperClassName)} onClick={(e) => e.stopPropagation()}>
        <Button
          variant="secondary"
          showMainButton={false}
          icon={<X width={12} height={12} />}
          iconButtonClassName={cn(
            "!w-12 !h-12 !p-0 absolute left-full top-6 ml-0 z-10 max-sm:!left-auto max-sm:!right-0 max-sm:!-top-16 max-sm:!ml-0",
            closeButtonClassName
          )}
          onClick={onClose}
        />

        <div className={cn("w-full max-h-[90vh] overflow-y-auto bg-rede-surface rounded-3xl p-5", panelClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
};