// components/ui/input-select.tsx
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn, normalizeText } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'

import { createPortal } from 'react-dom'
import { popoverPositionStyle, useAnchoredPopover, useScrollHighlightedIntoView } from './use-anchored-popover'

export const selectTriggerVariants = cva(
  'w-full inline-flex items-center justify-between font-medium transition-all rounded-lg bg-transparent text-rede-white border border-white/90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 text-left placeholder:text-rede-white/40 placeholder:text-[12px] placeholder:leading-4',
  {
    variants: {
      size: {
        sm: 'h-8 px-4 text-[12px]',
        md: 'h-9 px-5 text-[13px]',
        lg: 'h-11 px-6 text-[14px]',
        xl: 'h-13 px-8 text-[15px]',
      },
    },
    defaultVariants: { size: 'lg' },
  }
)

export const satelliteVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-all shrink-0 aspect-square bg-transparent text-rede-white border border-white/90 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-11 w-11',
        xl: 'h-13 w-13',
      },
    },
    defaultVariants: { size: 'lg' },
  }
)

export const variantStyles = {
  primary: {
    open: 'border-rede-yellow text-rede-yellow',
    popover: 'border-rede-yellow',
    checkFill: 'border-rede-yellow bg-rede-yellow text-rede-surface',
    checkEmpty: 'border-rede-yellow/40',
    selected: 'bg-rede-yellow text-rede-surface hover:bg-rede-yellow/90 hover:text-rede-surface',
    highlighted: 'bg-rede-yellow/10',
  },
  secondary: {
    open: 'border-white text-rede-white',
    popover: 'border-white',
    checkFill: 'border-white bg-white text-rede-surface',
    checkEmpty: 'border-white/40',
    selected: 'bg-white text-rede-surface hover:bg-white/90 hover:text-rede-surface',
    highlighted: 'bg-white/10',
  },
  danger: {
    open: 'border-rede-red text-rede-red',
    popover: 'border-rede-red',
    checkFill: 'border-rede-red bg-rede-red text-rede-white',
    checkEmpty: 'border-rede-red/40',
    selected: 'bg-rede-red text-rede-white hover:bg-rede-red/90 hover:text-rede-white',
    highlighted: 'bg-rede-red/10',
  },
}

export const popoverClassNames = 'z-[9999] overflow-hidden rounded-2xl border bg-rede-surface p-1.5 shadow-xl'

export const optionListClassNames = `max-h-80 overflow-y-auto space-y-1
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar]:h-3
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:bg-rede-yellow
  [&::-webkit-scrollbar-thumb]:rounded-full`

export const filterOptions = <T extends { label: string }>(options: T[], query: string) => {
  const q = normalizeText(query.trim())

  return q ? options.filter((option) => normalizeText(option.label).includes(q)) : options
}

export interface InputSelectOption {
  value: string
  label: string
}

export interface InputSelectProps {
  options: InputSelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'danger'
  allowFreeText?: boolean
  emptyMessage?: string
  className?: string
  triggerClassName?: string
  satelliteClassName?: string
  popoverClassName?: string
}

export const InputSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Digite ou selecione...',
  disabled,
  size = 'lg',
  variant = 'primary',
  allowFreeText = true,
  emptyMessage = 'Nenhuma opção encontrada',
  className,
  triggerClassName,
  satelliteClassName,
  popoverClassName,
}: InputSelectProps) => {
  const selectedLabel = options.find((opt) => opt.value === value)?.label
  const displayValue = selectedLabel ?? value ?? ''

  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState(displayValue)
  // So filtra depois de o utilizador escrever. Com um valor escolhido, o campo
  // mostra o nome dele: filtrar por esse texto deixava so a opcao escolhida
  // na lista ao voltar a abrir.
  const [isFiltering, setIsFiltering] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const v = variantStyles[variant]

  // Quando o value controlado muda, o campo passa a mostrar o nome dele.
  const [syncedDisplayValue, setSyncedDisplayValue] = React.useState(displayValue)
  if (displayValue !== syncedDisplayValue) {
    setSyncedDisplayValue(displayValue)
    setQuery(displayValue)
  }

  const filteredOptions = React.useMemo(
    () => (isFiltering ? filterOptions(options, query) : options),
    [options, query, isFiltering],
  )

  const close = () => {
    setIsOpen(false)
    setIsFiltering(false)
    if (!allowFreeText) setQuery(selectedLabel ?? '')
  }

  const { coords, containerRef, anchorRef, popoverRef } = useAnchoredPopover(isOpen, close)

  useScrollHighlightedIntoView(listRef, isOpen, highlightedIndex)

  // Ao abrir, a lista aparece completa e destaca a opcao escolhida.
  const open = () => {
    if (isOpen) return

    setIsOpen(true)
    setIsFiltering(false)
    setHighlightedIndex(Math.max(options.findIndex((opt) => opt.value === value), 0))
  }

  const selectOption = (option: InputSelectOption) => {
    setQuery(option.label)
    setIsFiltering(false)
    onChange?.(option.value)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setQuery(next)
    setIsFiltering(true)
    setHighlightedIndex(0)
    setIsOpen(true)
    if (allowFreeText) onChange?.(next)
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
      const opt = filteredOptions[highlightedIndex]
      if (opt) selectOption(opt)
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
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={(event) => {
            open()
            // Escrever substitui o nome escolhido em vez de o acrescentar.
            event.target.select()
          }}
          onKeyDown={handleKeyDown}
          className={cn(selectTriggerVariants({ size }), triggerClassName, isOpen && v.open)}
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

      {/* Menu via portal (position fixed), para nao ser cortado por modais. */}
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={popoverPositionStyle(coords)}
          className={cn(popoverClassNames, popoverClassName, v.popover)}
        >
          <ul ref={listRef} role="listbox" className={optionListClassNames} style={{ maxHeight: coords.maxHeight }}>
            {filteredOptions.length === 0 && (
              <li className="px-4 py-2.5 text-[13px] text-rede-white/40">{emptyMessage}</li>
            )}
            {filteredOptions.map((option, index) => {
              const isSelected = option.value === value
              const isHighlighted = index === highlightedIndex
              return (
                <li key={option.value} role="presentation" data-option-index={index}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectOption(option)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                      'text-rede-white/70 hover:bg-white/5 hover:text-rede-white',
                      isHighlighted && !isSelected && v.highlighted,
                      isSelected && v.selected,
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {isSelected && <Check width={16} height={16} />}
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
InputSelect.displayName = 'InputSelect'
