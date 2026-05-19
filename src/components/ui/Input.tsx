import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export function Input({ className, label, error, id, icon, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const inputElement = (
    <input
      id={inputId}
      className={cn(
        'w-full px-4 py-2.5 rounded-lg border border-coffee-300 bg-cream-50 text-coffee-900 placeholder:text-coffee-400',
        'focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500',
        'transition-colors duration-200',
        error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
        !!icon && 'pl-10',
        className
      )}
      {...props}
    />
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-coffee-700">
          {label}
        </label>
      )}
      {icon ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400">
            {icon}
          </span>
          {inputElement}
        </div>
      ) : (
        inputElement
      )}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}