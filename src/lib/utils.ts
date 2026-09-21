// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react'
import { extendTailwindMerge } from 'tailwind-merge'

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['h1', 'h2', 'h3', 'c1', 'b1', 'b2', 'btn1', 'btn2'] }
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}


// Em portugues escreve-se muitas vezes sem acento ao pesquisar: 'producao'
// tem de encontrar 'Produção'. Serve para comparar textos, nunca para os
// mostrar.
export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Links escritos pelos utilizadores vem muitas vezes sem protocolo
// ("youtu.be/..."): sem ele o browser trata-os como caminho do proprio site.
export function toExternalUrl(value?: string) {
  const url = value?.trim()
  if (!url) return ''

  return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`
}

export function openExternalUrl(value?: string) {
  const url = toExternalUrl(value)
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

export function withCurrentColor(icon: ReactNode) {
  if (!isValidElement<{ className?: string }>(icon)) return icon
  return cloneElement(icon, {
    className: cn('[&>*]:fill-current', icon.props.className),
  })
}