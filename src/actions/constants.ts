
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Limite imposto pela API em /api/v1/files/upload (rede-back file.schemas.ts).
export const MAX_UPLOAD_SIZE_MB = 2;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
export const ACCEPTED_DOCUMENT_TYPES =
  "application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const REDE_DATA = "rede.data";
// Aviso deixado para a pagina de login quando a sessao expira a meio da navegacao.
export const SESSION_EXPIRED_MESSAGE = "rede.session-expired";
export const AUTH_TOKEN = "auth.token";
export const REFR_TOKEN = "refr.token";

// NextAuth cookies (padrões do NextAuth.js)
export const NEXT_AUTH_MESSAGE = "nextauth.message";
export const NEXT_AUTH_CSRF_TOKEN = "next-auth.csrf-token";
export const NEXT_AUTH_CALLBACK_URL = "next-auth.callback-url";
export const NEXT_AUTH_SESSION_TOKEN = "next-auth.session-token";