"use client";

import React, {
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { ProfileType } from "../ProfileCard";
import { Text } from "../ui/text";
import { filterProfiles } from "./actions";
import { normalizeCountryValue } from "./filters";
import { getTaxonomy } from "@/lib/taxonomy";
import { useNetworkFilters } from "./useNetworkFilters";
import {
  NetworkProfilesStatus,
  useNetworkProfiles,
} from "./useNetworkProfiles";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

interface CountryData {
  id: string;
  iso3: string;
  name: string;
  nameInTopojson: string;
  isIsland: boolean;
  markerCoordinates: [number, number];
  labelFlip?: boolean;
}

interface GeographyData {
  id?: string | number;
  rsmKey: string;
  properties?: {
    name?: string;
  };
}

const countries: CountryData[] = [
  {
    id: "024",
    iso3: "AGO",
    name: "Angola",
    nameInTopojson: "Angola",
    isIsland: false,
    markerCoordinates: [10.9739, -11.2027],
  },
  {
    id: "132",
    iso3: "CPV",
    name: "Cabo Verde",
    nameInTopojson: "Cape Verde",
    isIsland: true,
    markerCoordinates: [-19.6, 16],
    labelFlip: true,
  },
  {
    id: "624",
    iso3: "GNB",
    name: "Guiné-Bissau",
    nameInTopojson: "Guinea-Bissau",
    isIsland: false,
    markerCoordinates: [-10.1804, 11.8037],
    labelFlip: true,
  },
  {
    id: "508",
    iso3: "MOZ",
    name: "Moçambique",
    nameInTopojson: "Mozambique",
    isIsland: false,
    markerCoordinates: [29.9, -19.6657],
  },
  {
    id: "678",
    iso3: "STP",
    name: "São Tomé e Príncipe",
    nameInTopojson: "Sao Tome and Principe",
    isIsland: true,
    markerCoordinates: [3.6111, 1.1864],
  },
  {
    id: "626",
    iso3: "TLS",
    name: "Timor-Leste",
    nameInTopojson: "Timor-Leste",
    isIsland: true,
    markerCoordinates: [120.7275, -8.8742],
  },
];

// Mocambique e o pais que o cartao mostra quando nao ha filtro de pais.
const DEFAULT_COUNTRY_ID = "508";

// O id do termo do pais (listas de Configuracoes) e a chave que liga o mapa
// aos filtros e aos perfis. Calculado a pedido: as listas chegam depois de o
// modulo carregar.
const countryValueOf = (country: CountryData) =>
  normalizeCountryValue(country.name);

const getMapCountryIdByValue = (value: string) =>
  countries.find((country) => countryValueOf(country) === value)?.id;

const COLORS = {
  bg: "#0f0f0f",
  default: "#1a1a1a",
  stroke: "#464643",
  defaultBg: "#464643",
  hover: "#666666",
  selected: "#fccb1c",
  selectedStroke: "transparent",
  cardBg: "#f5c518",
  cardText: "#1a1a1a",
  text: "#e0e0e0",
  buttonDefault: "#3a3a3a",
} as const;

const isPalopCountry = (
  geography: GeographyData,
): CountryData | undefined => {
  const geographyId = String(geography.id ?? "")
    .trim()
    .padStart(3, "0");

  const geographyName = String(
    geography.properties?.name ?? "",
  ).trim();

  return countries.find(
    (country) =>
      country.id === geographyId ||
      country.nameInTopojson.toLocaleLowerCase("pt-PT") ===
      geographyName.toLocaleLowerCase("pt-PT") ||
      country.name.toLocaleLowerCase("pt-PT") ===
      geographyName.toLocaleLowerCase("pt-PT"),
  );
};

// A API so distingue contas individuais e de empresa: os festivais e as
// instituicoes do cartao ficam a zero ate passarem a existir no perfil.
interface CountryStats {
  individual: number;
  company: number;
}

const EMPTY_STATS: CountryStats = {
  individual: 0,
  company: 0,
};

// Agrupa por pais os perfis que passam nos filtros aplicados. O pais de cada
// perfil ja vem normalizado do mapeamento partilhado com a pesquisa.
const buildStatsByCountry = (
  profiles: ProfileType[],
): Record<string, CountryStats> => {
  const stats: Record<string, CountryStats> = {};
  const companyTypeId = getTaxonomy().profileTypeIdBySlug.empresa;

  for (const profile of profiles) {
    if (!profile.country) continue;

    const current = stats[profile.country] ?? { ...EMPTY_STATS };

    if (profile.type === companyTypeId) current.company += 1;
    else current.individual += 1;

    stats[profile.country] = current;
  }

  return stats;
};

const StatRow: React.FC<{
  value: string;
  label: string;
}> = ({ value, label }) => (
  <div className="flex items-center gap-3">
    <span className="min-w-10 text-base font-normal text-[#1a1a1a]">
      {value}
    </span>

    <span className="text-sm text-[#333333]">{label}</span>
  </div>
);

const InfoCard: React.FC<{
  country: CountryData;
  stats: CountryStats;
  status: NetworkProfilesStatus;
}> = ({ country, stats, status }) => {
  // Enquanto os perfis nao chegam nao mostramos zeros: seriam lidos como
  // "este pais nao tem ninguem".
  const format = (value: number) =>
    status === "ready" ? String(value) : "–";

  return (
    <div className="absolute top-[450px] right-4 z-20 w-[190px] animate-[fadeIn_0.3s_ease] rounded-xl bg-[#f5c518] px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:top-[450px] sm:right-6 sm:w-[220px] sm:rounded-2xl sm:px-6 sm:py-5
    lg:top-[420px] lg:right-auto
    lg:left-[calc(50%+450px)] lg:w-auto lg:min-w-[220px] lg:-translate-x-1/2 lg:px-8 lg:py-6">
      <h2 className="mb-3 pr-4 text-base leading-tight font-medium text-[#1a1a1a] sm:mb-4 sm:text-xl lg:text-[22px]">
        {country.name}
      </h2>

      <div
        aria-hidden="true"
        className="absolute top-4 right-3 h-[calc(100%-2rem)] w-0.5 rounded-full bg-[#1a1a1a] sm:top-5 sm:right-4 sm:h-[calc(100%-2.5rem)] sm:w-[3px] lg:top-6 lg:h-[calc(100%-3rem)]"
      />

      <div
        aria-live="polite"
        className="flex flex-col gap-1.5 pr-3 sm:gap-2.5 sm:pr-4"
      >
        <StatRow
          value={format(stats.individual)}
          label="Profissionais"
        />

        <StatRow value={format(stats.company)} label="Empresas" />

        <StatRow value="0" label="Festivais" />

        <StatRow value="0" label="Instituições" />

        {status === "error" && (
          <p className="text-[11px] leading-tight text-[#333333]">
            Não foi possível carregar os perfis.
          </p>
        )}
      </div>
    </div>
  );
};

interface ArrowButtonProps {
  onClick: () => void;
  isActive: boolean;
  isHovered: boolean;
  flip?: boolean;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({
  onClick,
  isActive,
  isHovered,
  flip = false,
}) => (
  <g
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    style={{ cursor: "pointer" }}
  >
    <circle
      r="15"
      fill={
        isActive
          ? COLORS.selected
          : isHovered
            ? COLORS.hover
            : COLORS.buttonDefault
      }
      stroke={isActive ? COLORS.selectedStroke : "#555555"}
      strokeWidth="1"
      style={{ transition: "all 0.2s ease" }}
    />

    <path
      d="M -4 0 L 2 0 M 0 -3 L 4 0 L 0 3"
      fill="none"
      transform={`scale(${flip ? -1.5 : 1.5}, 1.5)`}
      stroke={isActive ? COLORS.cardText : "#ffffff"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pointerEvents: "none" }}
    />
  </g>
);

const PalopMapSection: React.FC = () => {
  // O pais em foco vem do filtro; enquanto nao houver filtro de pais fica o
  // ultimo escolhido no mapa (o cartao tem de mostrar sempre algum pais).
  const [lastSelectedId, setLastSelectedId] = useState(DEFAULT_COUNTRY_ID);

  const [hoveredId, setHoveredId] = useState<string | null>(
    null,
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  const { filters, setFilters } = useNetworkFilters();
  const { profiles, status } = useNetworkProfiles();

  const selectedId =
    (filters.country && getMapCountryIdByValue(filters.country)) ||
    lastSelectedId;

  const selectedCountry = useMemo(
    () =>
      countries.find((country) => country.id === selectedId) ??
      countries[3],
    [selectedId],
  );

  // O cartao reflecte os filtros aplicados, menos o de pais: esse e dado
  // pelo mapa, e cada pais precisa do seu proprio numero.
  const statsByCountry = useMemo(
    () =>
      buildStatsByCountry(
        filterProfiles(profiles, { ...filters, country: "" }),
      ),
    [filters, profiles],
  );

  const selectedStats =
    statsByCountry[countryValueOf(selectedCountry)] ?? EMPTY_STATS;

  const isSelected = useCallback(
    (id: string) => selectedId === id,
    [selectedId],
  );

  const isHovered = useCallback(
    (id: string) => hoveredId === id,
    [hoveredId],
  );

  // Clicar no mapa e escolher o pais no filtro: e a mesma coisa, e a
  // provincia e a localidade que estivessem escolhidas deixam de fazer
  // sentido noutro pais.
  const selectCountry = useCallback(
    (id: string) => {
      const country = countries.find((item) => item.id === id);

      setLastSelectedId(id);

      setFilters({
        ...filters,
        country: country ? countryValueOf(country) : "",
        province: "",
        city: "",
      });
    },
    [filters, setFilters],
  );

  const handleMarkerKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    countryId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectCountry(countryId);
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#0f0f0f] pt-17">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      <div className="relative">
        <div
          ref={scrollRef}
          className="w-full touch-pan-x overflow-x-auto overflow-y-hidden [scrollbar-color:#464643_#1a1a1a] [scrollbar-width:thin] lg:overflow-x-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
          aria-label="Mapa interativo dos PALOP e de Timor-Leste"
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 480,
              center: [60, -8],
              rotate: [0, 0, 0],
            }}
            width={1800}
            height={600}
            style={{
              width: "1800px",
              height: "100%",
              minHeight: "600px",
              display: "block",
            }}
          >
            <Geographies geography={GEO_URL}>
              {({
                geographies,
              }: {
                geographies: GeographyData[];
              }) => {
                const nonPalopCountries = geographies.filter(
                  (geography) => !isPalopCountry(geography),
                );

                const palopCountries = geographies.filter(
                  (geography) => isPalopCountry(geography),
                );

                return (
                  <>
                    {nonPalopCountries.map((geography) => (
                      <Geography
                        key={geography.rsmKey}
                        geography={geography}
                        fill={COLORS.default}
                        stroke={COLORS.stroke}
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))}

                    {palopCountries.map((geography) => {
                      const country =
                        isPalopCountry(geography);

                      if (!country) {
                        return null;
                      }

                      const selected =
                        country.id === selectedId;

                      const hovered =
                        country.id === hoveredId;

                      return (
                        <Geography
                          key={geography.rsmKey}
                          geography={geography}
                          fill={
                            selected
                              ? COLORS.selected
                              : hovered
                                ? COLORS.hover
                                : COLORS.defaultBg
                          }
                          stroke={
                            selected
                              ? COLORS.selectedStroke
                              : COLORS.stroke
                          }
                          strokeWidth={selected ? 2 : 1}
                          style={{
                            default: {
                              outline: "none",
                              transition: "all 0.25s ease",
                              cursor: "pointer",
                            },
                            hover: {
                              outline: "none",
                              transition: "all 0.25s ease",
                              cursor: "pointer",
                            },
                            pressed: {
                              outline: "none",
                            },
                          }}
                          onMouseEnter={() =>
                            setHoveredId(country.id)
                          }
                          onMouseLeave={() =>
                            setHoveredId(null)
                          }
                          onClick={() =>
                            selectCountry(country.id)
                          }
                        />
                      );
                    })}
                  </>
                );
              }}
            </Geographies>

            {countries.map((country) => {
              const selected = isSelected(country.id);
              const hovered = isHovered(country.id);

              return (
                <Marker
                  key={country.id}
                  coordinates={country.markerCoordinates}
                >
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`Selecionar ${country.name}`}
                    onMouseEnter={() =>
                      setHoveredId(country.id)
                    }
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(country.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() =>
                      selectCountry(country.id)
                    }
                    onKeyDown={(event) =>
                      handleMarkerKeyDown(event, country.id)
                    }
                    style={{
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <circle r="20" fill="transparent" />

                    {(country.isIsland ||
                      country.id === "624") && (
                        <circle
                          r="4"
                          fill={
                            selected
                              ? COLORS.selectedStroke
                              : hovered
                                ? COLORS.hover
                                : "#444444"
                          }
                          stroke={
                            selected
                              ? COLORS.selectedStroke
                              : "#666666"
                          }
                          strokeWidth={1}
                          style={{
                            transition: "all 0.25s ease",
                            pointerEvents: "none",
                          }}
                        />
                      )}

                    <text
                      x={country.labelFlip ? 24 : -24}
                      y={0}
                      textAnchor={
                        country.labelFlip ? "start" : "end"
                      }
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="18px"
                      fontWeight={selected ? 700 : 500}
                      style={{
                        pointerEvents: "none",
                        transition: "fill 0.25s ease",
                        lineHeight: "16px",
                      }}
                    >
                      {country.name}
                    </text>

                    <ArrowButton
                      onClick={() =>
                        selectCountry(country.id)
                      }
                      isActive={selected}
                      isHovered={hovered}
                      flip={country.labelFlip}
                    />
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        <p className="px-4 pt-3 text-center text-xs text-[#e0e0e0]/70 lg:hidden">
          Desliza horizontalmente para explorar todos os países.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 lg:contents">
        <InfoCard
          country={selectedCountry}
          stats={selectedStats}
          status={status}
        />
      </div>

      <div className="w-full flex justify-center">
        <Text className="max-w-[560px] text-sm text-center font-semibold leading-relaxed text-rede-white sm:text-base lg:max-w-2xl">
          Conecta-te a realizadores, produtores, técnicos e criativos dos PALOP + Timor-Leste, fortalece a
          tua rede profissional e descobre novas oportunidades de colaboração, circulação e desenvolvimento
          no setor audiovisual.
        </Text>
      </div>

    </section>
  );
};

export default PalopMapSection;