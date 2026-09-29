// components/ui/select-multiple.tsx
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'
import { popoverPositionStyle, useAnchoredPopover } from './use-anchored-popover'

const selectTriggerVariants = cva(
  'w-full inline-flex items-center justify-between font-medium transition-all rounded-lg bg-transparent text-rede-white border border-white/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 text-left',
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
  'inline-flex items-center justify-center rounded-full transition-all shrink-0 aspect-square bg-transparent text-rede-white border border-white/20 disabled:cursor-not-allowed',
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
  },
  secondary: {
    open: 'border-white text-rede-white',
    popover: 'border-white',
    checkFill: 'border-white bg-white text-rede-surface',
    checkEmpty: 'border-white/40',
  },
  danger: {
    open: 'border-rede-red text-rede-red',
    popover: 'border-rede-red',
    checkFill: 'border-rede-red bg-rede-red text-rede-white',
    checkEmpty: 'border-rede-red/40',
  },
}

export interface SelectOption {
  value: string
  label: string
}

export interface SelectMultipleProps {
  options: SelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  triggerClassName?: string
  satelliteClassName?: string
  popoverClassName?: string
}

export const SelectMultiple = ({
  options,
  value = [],
  onChange,
  placeholder = 'Selecione uma opção...',
  disabled,
  size = 'lg',
  variant = 'primary',
  className,
  triggerClassName,
  satelliteClassName,
  popoverClassName,
}: SelectMultipleProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const close = React.useCallback(() => setIsOpen(false), [])
  const { coords, containerRef, anchorRef, popoverRef } = useAnchoredPopover(isOpen, close)

  const selectedOptions = options.filter((opt) => value.includes(opt.value))
  const v = variantStyles[variant]

  const triggerLabel = selectedOptions.length === 0
    ? placeholder
    : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions[0].label} +${selectedOptions.length - 1}`

  const handleToggle = (optionValue: string) => {
    if (!onChange) return
    if (value.includes(optionValue)) {
      onChange(value.filter((val) => val !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  // Dentro do componente, antes do return
  const scrollbarColor = {
    primary: '#F5C518', // rede-yellow — substitui pelo teu valor real
    secondary: '#FFFFFF',
    danger: '#E53E3E',  // rede-red — substitui pelo teu valor real
  }[variant]

  return (
    <div ref={containerRef} className={cn('relative inline-flex flex-col w-full gap-2', className)}>
      <div ref={anchorRef} className="inline-flex items-center w-full">

        {/* CORPO DO SELECT */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            selectTriggerVariants({ size }),
            triggerClassName,
            isOpen && v.open,
          )}
        >
          <span className={cn(!selectedOptions.length && 'opacity-40')}>
            {triggerLabel}
          </span>
        </button>

        {/* SATÉLITE (CHEVRON) */}
        <button
          type="button"
          disabled={disabled}
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

      {/* MENU DROPDOWN */}
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

          <style>{`
      .rede-select-scroll-${variant}::-webkit-scrollbar {
        width: 2px;
      }
      .rede-select-scroll-${variant}::-webkit-scrollbar-track {
        background: transparent;
      }
      .rede-select-scroll-${variant}::-webkit-scrollbar-thumb {
        background-color: ${scrollbarColor};
        border-radius: 999px;
      }
    `}</style>

          <ul
            className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin"
            style={{
              maxHeight: coords.maxHeight,
              //scrollbarWidth: '2px', // Firefox (thin é o mínimo, mas o color acompanha)
              scrollbarColor: `${scrollbarColor} transparent`,
            }}
          >
            {options.map((option) => {
              const isSelected = value.includes(option.value)
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                      'text-rede-white/70 hover:bg-white/5 hover:text-rede-white',
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* CHECKBOX CIRCULAR */}
                      <span className={cn(
                        'flex items-center justify-center w-5 h-5 rounded-full border-[1.3px] shrink-0 transition-all duration-150',
                        isSelected ? v.checkFill : v.checkEmpty,
                      )}>
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

SelectMultiple.displayName = 'SelectMultiple'