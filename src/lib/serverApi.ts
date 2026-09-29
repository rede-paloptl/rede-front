const productionApiBaseUrl = "https://api.redecinemapaloptl.org";

export const getServerApiBaseUrl = () => {
  const apiPort = process.env.API_PORT ?? "4001";
  const apiHost = process.env.API_HOST ?? "http://localhost";
  const apiBaseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === "production"
      ? productionApiBaseUrl
      : `${apiHost}:${apiPort}`);

  return apiBaseUrl.replace(/\/$/, "");
};