// components/ui/select.tsx
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom';
import { popoverPositionStyle, useAnchoredPopover } from './use-anchored-popover'

const selectTriggerVariants = cva(
  'w-full inline-flex items-center justify-between font-medium transition-all rounded-lg bg-transparent text-rede-white border border-white/90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 text-left',
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

const satelliteVariants = cva(
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

const variantStyles = {
  primary: {
    open: 'border-rede-yellow text-rede-yellow',
    popover: 'border-rede-yellow',
    checkFill: 'border-rede-yellow bg-rede-yellow text-rede-surface',
    checkEmpty: 'border-rede-yellow/40',
    selected: 'bg-rede-yellow text-rede-surface hover:bg-rede-yellow/90 hover:text-rede-surface',
  },
  secondary: {
    open: 'border-white text-rede-white',
    popover: 'border-white',
    checkFill: 'border-white bg-white text-rede-surface',
    checkEmpty: 'border-white/40',
    selected: 'bg-white text-rede-surface hover:bg-white/90 hover:text-rede-surface',
  },
  danger: {
    open: 'border-rede-red text-rede-red',
    popover: 'border-rede-red',
    checkFill: 'border-rede-red bg-rede-red text-rede-white',
    checkEmpty: 'border-rede-red/40',
    selected: 'bg-rede-red text-rede-white hover:bg-rede-red/90 hover:text-rede-white',
  },
}

export interface SelectOption {
  value: string
  label: string
  // Número opcional mostrado à direita da opção (ex.: resultados por filtro).
  count?: number
}

// Os selects não têm botão próprio para desmarcar, por isso a opção de repor
// entra no topo da lista — mas só quando já existe algo escolhido, para que o
// placeholder continue visível e a lista original fique intacta enquanto o
// filtro está vazio. Devolve sempre um array novo: nunca altera o original.
export const withClearOption = (
  options: SelectOption[],
  selectedValue: string,
  label: string,
): SelectOption[] =>
  selectedValue ? [{ label, value: '' }, ...options] : options

// Variante para filtros em que "todos" é um estado de pleno direito e não a
// ausência de escolha: a opção fica sempre no topo e, com o valor vazio, é ela
// que aparece no trigger (com o visto) em vez do placeholder.
export const withAllOption = (
  options: SelectOption[],
  label: string,
  count?: number,
): SelectOption[] => [{ label, value: '', count }, ...options]

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  triggerClassName?: string
  satelliteClassName?: string
  popoverClassName?: string
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção...',
  disabled,
  size = 'lg',
  variant = 'primary',
  className,
  triggerClassName,
  satelliteClassName,
  popoverClassName,
}: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const close = React.useCallback(() => setIsOpen(false), [])
  // anchorRef engloba trigger + chevron
  const { coords, containerRef, anchorRef, popoverRef } = useAnchoredPopover(isOpen, close)

  const selectedOption = options.find((opt) => opt.value === value)
  const v = variantStyles[variant]

  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])


  return (
    <div ref={containerRef} className={cn('relative inline-flex flex-col w-full gap-2', className)}>
      <div ref={anchorRef} className="inline-flex items-center w-full">

        {/* CORPO DO SELECT */}
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            selectTriggerVariants({ size }),
            triggerClassName,
            isOpen && v.open,
          )}
        >
          <span className={cn(!selectedOption && 'opacity-40 text-[12px] leading-4')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>

        {/* SATÉLITE (CHEVRON) */}
        <button
          type="button"
          disabled={disabled}
          // Repete o trigger: fora da ordem de tabulação e do leitor de ecrã.
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            satelliteVariants({ size }),
            satelliteClassName,
            isOpen && v.open,
          )}
        >
          <ChevronDown
            className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
      </div>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={popoverPositionStyle(coords)}
          className={cn(
            'z-[9999] overflow-hidden rounded-2xl border bg-rede-surface p-1.5 shadow-xl',
            popoverClassName,
            v.popover,
          )}
        >
          <ul role="listbox" style={{ maxHeight: coords.maxHeight }} className="max-h-80 overflow-y-auto space-y-1
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar]:h-3
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:bg-rede-yellow
      [&::-webkit-scrollbar-thumb]:rounded-full
    ">
            {options.map((option, index) => {
              const isSelected = option.value === value
              // A opção de repor ("Todos...") fica separada das escolhas concretas.
              const isResetOption =
                index === 0 && option.value === '' && options.length > 1
              return (
                <li
                  key={option.value}
                  role="presentation"
                  className={cn(isResetOption && 'border-b border-white/10 pb-1')}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onChange) onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                      'text-rede-white/70 hover:bg-white/5 hover:text-rede-white',
                      isSelected && v.selected,
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 w-full">
                      <span>{option.label}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        {option.count !== undefined && (
                          <span
                            className={cn(
                              'text-[12px] tabular-nums',
                              isSelected ? 'opacity-70' : 'text-rede-white/40',
                            )}
                          >
                            {option.count}
                          </span>
                        )}
                        {isSelected && <Check width={16} height={16} />}
                      </span>
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

Select.displayName = 'Select'