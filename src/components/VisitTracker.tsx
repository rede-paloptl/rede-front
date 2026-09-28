"use client";

import { useEffect, useRef } from "react";
import { trackVisit, type TrackVisitPayload } from "@/actions/analytics";

/**
 * Regista uma visita quando a pagina abre no browser. Os crawlers que nao
 * correm JavaScript nao contam, e o servidor ignora os restantes bots.
 */
export const VisitTracker: React.FC<TrackVisitPayload> = (props) => {
  const key =
    props.page === "profile"
      ? `profile:${props.username}`
      : props.page === "home"
        ? props.page
        : `${props.page}:${props.contentId}`;
  const trackedKey = useRef<string | null>(null);

  useEffect(() => {
    // Em desenvolvimento o StrictMode corre os efeitos duas vezes.
    if (trackedKey.current === key) return;
    trackedKey.current = key;

    void trackVisit(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
};
