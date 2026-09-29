// components/ui/input.tsx
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const interactionVariants = {
  primary: {
    hover: 'border-rede-yellow text-rede-yellow',
    active:
      'border-rede-yellow text-rede-yellow shadow-[0_0_0_0.3px_var(--rede-yellow-200),0_0_0_1px_var(--rede-yellow-200)_inset,0_0_0_4px_var(--rede-bg-900)_inset]',
  },
  secondary: {
    hover: 'border-foreground text-foreground',
    active:
      'border-foreground text-foreground shadow-[0_0_0_0.3px_var(--rede-white),0_0_0_1px_var(--rede-white)_inset,0_0_0_4px_var(--rede-bg-900)_inset]',
  },
  danger: {
    hover: 'border-rede-red text-rede-red',
    active:
      'border-rede-red text-rede-red shadow-[0_0_0_0.3px_var(--rede-red-300),0_0_0_1px_var(--rede-red-300)_inset,0_0_0_4px_var(--rede-bg-900)_inset]',
  },
} as const

const inputVariants = cva(
  'w-full font-medium transition-all rounded-[8px] bg-rede-surface text-rede-white border outline-none disabled:cursor-not-allowed disabled:opacity-40 px-6 h-11 text-btn1',
  {
    variants: {
      variant: {
        primary: 'border-foreground/20',
        secondary: 'border-foreground',
        danger: 'border-rede-red/40',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

const iconSatelliteVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-all shrink-0 aspect-square h-11 w-11 border bg-transparent',
  {
    variants: {
      variant: {
        primary: 'text-foreground border-foreground/20',
        secondary: 'text-foreground border-foreground',
        danger: 'text-rede-red border-rede-red/40',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  containerClassName?: string
  iconContainerClassName?: string
  onIconClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

function withCurrentColor(icon: React.ReactNode): React.ReactNode {
  if (!React.isValidElement<{ color?: string }>(icon)) return icon
  if (icon.props.color !== undefined) return icon
  return React.cloneElement(icon, { color: 'currentColor' })
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant,
      icon,
      iconPosition = 'left',
      containerClassName,
      iconContainerClassName,
      className,
      disabled,
      onIconClick,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    const [isHovered, setIsHovered] = React.useState(false)
    const [isInteractionActive, setIsInteractionActive] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)

    const handleIconClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return

      if (onIconClick) {
        onIconClick(event)
        return
      }

      inputRef.current?.focus()
    }

    const isHighlighted = isHovered || isFocused

    const renderIconSatellite = icon ? (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={handleIconClick}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            handleIconClick(e as unknown as React.MouseEvent<HTMLDivElement>)
          }
        }}
        className={cn(
          iconSatelliteVariants({ variant }),
          {
            [interactionVariants[variant ?? 'primary'].hover]: isHighlighted,
            [interactionVariants[variant ?? 'primary'].active]:
              isInteractionActive,
          },
          disabled && 'pointer-events-none cursor-not-allowed opacity-40',
          !disabled && 'cursor-pointer',
          iconContainerClassName
        )}
      >
        {withCurrentColor(icon)}
      </div>
    ) : null

    return (
      <div
        className={cn('inline-flex items-center w-full', containerClassName)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setIsInteractionActive(false)
        }}
        onMouseDown={() => setIsInteractionActive(true)}
        onMouseUp={() => setIsInteractionActive(false)}
      >
        {iconPosition === 'left' && renderIconSatellite}

        <input
          ref={inputRef}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            setIsInteractionActive(false)
            onBlur?.(e)
          }}
          className={cn(
            inputVariants({ variant }),
            {
              [interactionVariants[variant ?? 'primary'].hover]:
                isHighlighted,
              [interactionVariants[variant ?? 'primary'].active]:
                isInteractionActive,
            },
            props.type === 'date' &&
              '[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer',
            className
          )}
          {...props}
        />

        {iconPosition === 'right' && renderIconSatellite}
      </div>
    )
  }
)

Input.displayName = 'Input'