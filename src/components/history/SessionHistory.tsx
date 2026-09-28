"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, KeyRound, Laptop, Monitor, Smartphone, Tablet } from "lucide-react";

import {
  getSessionHistory,
  type GetSessionsResponseType,
  type SessionMethod,
  type UserSession,
} from "@/actions/sessions";
import { ContentState } from "@/components/ContentState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatDate = (value: string | null) => (value ? dateFormatter.format(new Date(value)) : "—");

const methodLabels: Record<SessionMethod, string> = {
  password: "Email e password",
  google: "Conta Google",
  confirmation: "Confirmação da conta",
};

const statusStyles: Record<UserSession["status"], { label: string; className: string }> = {
  active: { label: "Activa", className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  ended: { label: "Terminada", className: "border-white/15 bg-white/5 text-rede-bg-200" },
  expired: { label: "Expirada", className: "border-rede-yellow/30 bg-rede-yellow/10 text-rede-yellow" },
};

const DeviceIcon: React.FC<{ device: UserSession["device"] }> = ({ device }) => {
  const Icon = device === "mobile" ? Smartphone : device === "tablet" ? Tablet : device === "desktop" ? Laptop : Monitor;
  return <Icon aria-hidden="true" className="h-5 w-5 text-rede-yellow" />;
};

const formatLocation = (location: UserSession["location"]) =>
  [location.city, location.country].filter(Boolean).join(", ") || "Localização desconhecida";

export const SessionHistory: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading, expireSession } = useAuth();

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const applyResponse = useCallback((nextPage: number, response: GetSessionsResponseType) => {
    if (response.unauthorized) {
      expireSession(response.message);
      return;
    }

    if (response.error || !response.data) {
      setErrorMessage(response.message || "Não foi possível carregar o histórico de sessões.");
      setStatus("error");
      return;
    }

    setSessions((current) => nextPage === 1 ? response.data!.sessions : [...current, ...response.data!.sessions]);
    setTotal(response.data.total);
    setPage(nextPage);
    setStatus("ready");
  }, [expireSession]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    void getSessionHistory(1, PAGE_SIZE).then((response) => applyResponse(1, response));
  }, [loading, isAuthenticated, applyResponse, router]);

  const reload = (nextPage: number) => {
    setStatus("loading");
    void getSessionHistory(nextPage, PAGE_SIZE).then((response) => applyResponse(nextPage, response));
  };

  const hasMore = sessions.length < total;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-rede-yellow">Segurança da conta</p>
        <h1 className="mt-2 text-3xl font-semibold text-rede-white">Histórico de sessões</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-rede-bg-200">
          Inícios e términos de sessão da sua conta. Se não reconhecer algum acesso, altere a sua password o mais
          depressa possível. A localização é aproximada e baseada no endereço IP.
        </p>
      </header>

      {status === "error" && sessions.length === 0 ? (
        <ContentState variant="error" message={errorMessage} onRetry={() => reload(1)} />
      ) : status === "loading" && sessions.length === 0 ? (
        <ContentState variant="loading" message="A carregar o histórico…" />
      ) : sessions.length === 0 ? (
        <ContentState variant="empty" message="Ainda não há sessões registadas." />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => {
              const badge = statusStyles[session.status];

              return (
                <li
                  key={session.id}
                  className={cn(
                    "rounded-2xl border bg-white/[0.03] p-4 sm:p-5",
                    session.isCurrent ? "border-rede-yellow/50" : "border-white/10",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                        <DeviceIcon device={session.device} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-rede-white">
                          {session.os} · {session.browser}
                        </p>
                        <p className="flex items-center gap-1.5 truncate text-sm text-rede-bg-200">
                          <Globe aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          {formatLocation(session.location)}
                          {session.ip && <span className="text-rede-bg-300">· {session.ip}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.isCurrent && (
                        <span className="rounded-full bg-rede-yellow px-2.5 py-0.5 text-xs font-semibold text-rede-surface">
                          Esta sessão
                        </span>
                      )}
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", badge.className)}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-rede-bg-300">Início</dt>
                      <dd className="text-rede-white">{formatDate(session.startedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-rede-bg-300">
                        {session.status === "active" ? "Expira em" : "Término"}
                      </dt>
                      <dd className="text-rede-white">
                        {formatDate(session.status === "active" ? session.expiresAt : session.finishedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-rede-bg-300">Método</dt>
                      <dd className="flex items-center gap-1.5 text-rede-white">
                        <KeyRound aria-hidden="true" className="h-3.5 w-3.5 text-rede-bg-300" />
                        {methodLabels[session.method]}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>

          {status === "error" && (
            <p role="alert" className="mt-4 text-center text-sm text-rede-red">{errorMessage}</p>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                disabled={status === "loading"}
                onClick={() => reload(page + 1)}
              >
                {status === "loading" ? "A carregar…" : "Carregar mais"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
