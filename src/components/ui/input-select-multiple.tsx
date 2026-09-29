// components/ui/input-select-multiple.tsx
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  filterOptions,
  InputSelectOption,
  optionListClassNames,
  popoverClassNames,
  satelliteVariants,
  selectTriggerVariants,
  variantStyles,
} from './input-select'
import { popoverPositionStyle, useAnchoredPopover, useScrollHighlightedIntoView } from './use-anchored-popover'

export interface InputSelectMultipleProps {
  options: InputSelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  /** Máximo de opções escolhidas; ao atingi-lo, as restantes ficam indisponíveis. */
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'danger'
  emptyMessage?: string
  className?: string
  triggerClassName?: string
  satelliteClassName?: string
  popoverClassName?: string
}

/**
 * Lista com pesquisa e escolha múltipla. A lista mantém todas as opções, com
 * as escolhidas marcadas, e fica aberta enquanto se escolhe: clicar numa
 * opção marca-a ou desmarca-a.
 */
export const InputSelectMultiple = ({
  options,
  value = [],
  onChange,
  placeholder = 'Pesquisar e selecionar...',
  disabled,
  max,
  size = 'lg',
  variant = 'primary',
  emptyMessage = 'Nenhuma opção encontrada',
  className,
  triggerClassName,
  satelliteClassName,
  popoverClassName,
}: InputSelectMultipleProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const v = variantStyles[variant]
  const isAtMax = max !== undefined && value.length >= max
  const filteredOptions = React.useMemo(() => filterOptions(options, query), [options, query])

  const selectedLabels = options.filter((option) => value.includes(option.value)).map((option) => option.label)
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels[0]} +${selectedLabels.length - 1}`

  const close = () => {
    setIsOpen(false)
    setQuery('')
  }

  const { coords, containerRef, anchorRef, popoverRef } = useAnchoredPopover(isOpen, close)

  useScrollHighlightedIntoView(listRef, isOpen, highlightedIndex)

  const open = () => {
    if (isOpen) return

    setIsOpen(true)
    setHighlightedIndex(0)
  }

  const toggleOption = (option: InputSelectOption) => {
    const isSelected = value.includes(option.value)

    if (!isSelected && isAtMax) return

    onChange?.(isSelected ? value.filter((item) => item !== option.value) : [...value, option.value])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      open()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = filteredOptions[highlightedIndex]
      if (option) toggleOption(option)
    } else if (e.key === 'Escape') {
      close()
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className={cn('relative inline-flex flex-col w-full gap-2', className)}>
      <div ref={anchorRef} className="inline-flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={query}
          // Fechado, o campo resume o que está escolhido; aberto, serve para pesquisar.
          placeholder={isOpen ? placeholder : summary}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlightedIndex(0)
            setIsOpen(true)
          }}
          onFocus={open}
          onKeyDown={handleKeyDown}
          className={cn(
            selectTriggerVariants({ size }),
            // Com opções escolhidas, o resumo lê-se como valor e não como dica.
            !isOpen && selectedLabels.length > 0 && 'placeholder:text-rede-white placeholder:text-[14px]',
            triggerClassName,
            isOpen && v.open,
          )}
        />
        <button
          type="button"
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => {
            if (isOpen) {
              close()
              return
            }

            open()
            inputRef.current?.focus()
          }}
          className={cn(satelliteVariants({ size }), satelliteClassName, isOpen && v.open)}
        >
          <ChevronDown className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>
      </div>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={popoverPositionStyle(coords)}
          className={cn(popoverClassNames, popoverClassName, v.popover)}
        >
          <ul ref={listRef} role="listbox" aria-multiselectable="true" className={optionListClassNames} style={{ maxHeight: coords.maxHeight }}>
            {filteredOptions.length === 0 && (
              <li className="px-4 py-2.5 text-[13px] text-rede-white/40">{emptyMessage}</li>
            )}
            {filteredOptions.map((option, index) => {
              const isSelected = value.includes(option.value)
              const isUnavailable = !isSelected && isAtMax

              return (
                <li key={option.value} role="presentation" data-option-index={index}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isUnavailable}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                      'text-rede-white/70 hover:bg-white/5 hover:text-rede-white',
                      index === highlightedIndex && v.highlighted,
                      isUnavailable && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-rede-white/70',
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span
                        className={cn(
                          'flex items-center justify-center w-5 h-5 rounded-full border-[1.3px] shrink-0 transition-all duration-150',
                          isSelected ? v.checkFill : v.checkEmpty,
                        )}
                      >
                        {isSelected && <Check width={11} height={11} strokeWidth={3} />}
                      </span>
                      <span className={cn(isSelected && 'text-rede-white')}>{option.label}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>,
        document.body
      )}
    </div>
  )
}
InputSelectMultiple.displayName = 'InputSelectMultiple'
