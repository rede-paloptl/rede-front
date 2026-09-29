'use client'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

export type GoogleProfile = {
  name: string
  email: string
  image: string
}

export type GoogleSignInResult = {
  idToken: string
  profile: GoogleProfile
}

type GoogleCredentialResponse = {
  credential: string
}

type GoogleIdConfig = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  ux_mode?: 'popup' | 'redirect'
}

export type GoogleButtonOptions = {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number
  locale?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void
        }
      }
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('O Google Sign-In só está disponível no browser.'))
  }

  if (window.google?.accounts?.id) return Promise.resolve()

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = GOOGLE_SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => {
        scriptPromise = null
        reject(new Error('Não foi possível carregar o Google Sign-In.'))
      }
      document.head.appendChild(script)
    })
  }

  return scriptPromise
}

// Decodes the (already Google-signed) JWT payload just to preview the
// profile in the UI. This is NOT verification — the backend must verify
// the token's signature before trusting any of its claims.
function decodeIdTokenPayload(idToken: string): GoogleProfile {
  const payload = idToken.split('.')[1]
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  const json = JSON.parse(new TextDecoder().decode(bytes))

  return {
    name: json.name ?? '',
    email: json.email ?? '',
    image: json.picture ?? '',
  }
}

// O GIS so aceita um callback global. Guardamos aqui o handler do botao
// montado mais recentemente e o initialize fica feito uma unica vez.
let activeHandler: ((result: GoogleSignInResult) => void) | null = null
let initialized = false

async function ensureGoogleInitialized(): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    throw new Error('Login com Google não está configurado.')
  }

  await loadGoogleScript()

  if (initialized) return

  const google = window.google
  if (!google) {
    throw new Error('Não foi possível carregar o Google Sign-In.')
  }

  google.accounts.id.initialize({
    client_id: clientId,
    ux_mode: 'popup',
    auto_select: false,
    cancel_on_tap_outside: true,
    callback: (response) => {
      if (!response.credential) return
      activeHandler?.({
        idToken: response.credential,
        profile: decodeIdTokenPayload(response.credential),
      })
    },
  })

  initialized = true
}

// Desenha o botao oficial "Sign in with Google" dentro de `parent`. Ao
// contrario do One Tap, abre sempre um popup de escolha/login de conta,
// mesmo sem sessao Google activa no browser.
export async function renderGoogleButton(
  parent: HTMLElement,
  onCredential: (result: GoogleSignInResult) => void,
  options: GoogleButtonOptions = {},
): Promise<() => void> {
  await ensureGoogleInitialized()

  activeHandler = onCredential
  parent.innerHTML = ''
  window.google!.accounts.id.renderButton(parent, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    logo_alignment: 'center',
    locale: 'pt-PT',
    ...options,
  })

  return () => {
    if (activeHandler === onCredential) activeHandler = null
  }
}
