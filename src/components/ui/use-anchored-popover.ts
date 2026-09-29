import * as React from 'react'

const LIST_MAX_HEIGHT = 320
const LIST_MIN_HEIGHT = 120
const VIEWPORT_GAP = 12
const TRIGGER_GAP = 8
// Padding e borda do contentor do menu, que ficam à volta da lista.
const POPOVER_CHROME = 16

export type PopoverCoords = {
  top?: number
  bottom?: number
  left: number
  width: number
  /** Altura máxima da lista de opções, para o menu caber no ecrã. */
  maxHeight: number
}

/**
 * Abre por baixo do campo; se não houver espaço e houver mais em cima, abre
 * por cima. Por cima, ancora pelo `bottom` para o menu ficar colado ao campo
 * mesmo quando tem poucas opções.
 */
export function computePopoverCoords(rect: DOMRect): PopoverCoords {
  const reserved = VIEWPORT_GAP + TRIGGER_GAP + POPOVER_CHROME
  const spaceBelow = window.innerHeight - rect.bottom - reserved
  const spaceAbove = rect.top - reserved
  const openAbove = spaceBelow < 180 && spaceAbove > spaceBelow
  const maxHeight = Math.max(LIST_MIN_HEIGHT, Math.min(LIST_MAX_HEIGHT, openAbove ? spaceAbove : spaceBelow))

  return openAbove
    ? { bottom: window.innerHeight - rect.top + TRIGGER_GAP, left: rect.left, width: rect.width, maxHeight }
    : { top: rect.bottom + TRIGGER_GAP, left: rect.left, width: rect.width, maxHeight }
}

/** Estilo do contentor do menu (portal), a partir das coordenadas. */
export function popoverPositionStyle(coords: PopoverCoords): React.CSSProperties {
  return { position: 'fixed', top: coords.top, bottom: coords.bottom, left: coords.left, width: coords.width }
}

/**
 * Posição e fecho de um menu que abre por baixo de um campo.
 *
 * O menu é desenhado num portal (position fixed) para não ser cortado por
 * contentores com overflow, como o corpo de um modal. Por isso a posição
 * acompanha o scroll e o resize, e o "clique fora" tem de considerar tanto o
 * campo como o próprio menu. Só abre depois de uma interacção, por isso o
 * portal nunca é desenhado no servidor.
 */
export function useAnchoredPopover(isOpen: boolean, onClickOutside: () => void) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const [coords, setCoords] = React.useState<PopoverCoords>({ top: 0, left: 0, width: 0, maxHeight: LIST_MAX_HEIGHT })

  const updateCoords = React.useCallback(() => {
    if (!anchorRef.current) return

    setCoords(computePopoverCoords(anchorRef.current.getBoundingClientRect()))
  }, [])

  React.useEffect(() => {
    if (!isOpen) return

    updateCoords()
    window.addEventListener('scroll', updateCoords, true)
    window.addEventListener('resize', updateCoords)

    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [isOpen, updateCoords])

  // A referência mais recente, para o listener não ter de ser recriado a cada render.
  const onClickOutsideRef = React.useRef(onClickOutside)
  React.useEffect(() => {
    onClickOutsideRef.current = onClickOutside
  })

  React.useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (containerRef.current?.contains(target) || popoverRef.current?.contains(target)) return

      onClickOutsideRef.current()
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  return { coords, containerRef, anchorRef, popoverRef }
}

/** Mantém visível a opção destacada ao navegar com o teclado. */
export function useScrollHighlightedIntoView(
  listRef: React.RefObject<HTMLUListElement | null>,
  isOpen: boolean,
  highlightedIndex: number,
) {
  React.useEffect(() => {
    if (!isOpen) return

    const item = listRef.current?.querySelector<HTMLElement>(`[data-option-index="${highlightedIndex}"]`)
    item?.scrollIntoView({ block: 'nearest' })
  }, [listRef, isOpen, highlightedIndex])
}
