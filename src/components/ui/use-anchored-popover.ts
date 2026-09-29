import * as React from 'react'

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

  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 })

  const updateCoords = React.useCallback(() => {
    if (!anchorRef.current) return

    const rect = anchorRef.current.getBoundingClientRect()
    setCoords({ top: rect.bottom + 8, left: rect.left, width: rect.width })
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
