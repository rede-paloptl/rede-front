import axios from "axios";

const productionApiBaseUrl = "https://api.redecinemapaloptl.org";
// 127.0.0.1 e nao localhost: no Node, localhost pode resolver para ::1 (IPv6)
// e cair noutro servico na mesma porta (ex: um container Docker).
const localApiBaseUrl = "http://127.0.0.1:4001";
/**
 * Resolve o endereco da API conforme o ambiente.
 *
 * Este ficheiro corre no browser, onde o Next so injecta variaveis com o
 * prefixo NEXT_PUBLIC_. NODE_ENV e a excepcao: e substituido em build time
 * tanto no servidor como no cliente, por isso serve para distinguir o ambiente
 * sem ser preciso configurar nada.
 *
 * Definir NEXT_PUBLIC_API_BASE_URL sobrepoe-se sempre (util para apontar o
 * local a um staging). Atencao: sendo NEXT_PUBLIC_, o valor fica gravado no
 * bundle em build time — mudar na Vercel obriga a novo deploy.
 */
const resolveApiBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configured) {
    return configured.endsWith("/") ? configured.slice(0, -1) : configured;
  }

  return process.env.NODE_ENV === "development"
    ? localApiBaseUrl
    : productionApiBaseUrl;
};

export const apiBaseUrl = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth.token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const apiRoutes = {
  signup: process.env.API_SIGNUP_PATH ?? "/auth/signup",
  login: process.env.API_LOGIN_PATH ?? "/auth/login",
  signupWithGoogle:
    process.env.API_SIGNUP_GOOGLE_PATH ?? "/auth/google/signup",
  loginWithGoogle:
    process.env.API_LOGIN_GOOGLE_PATH ?? "/auth/google/login",
};