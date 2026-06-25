import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react'
import { FieldError } from './FieldError'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className = '', children, ...rest },
  ref,
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:bg-stone-50 disabled:text-stone-400 ${
          error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-200'
            : 'border-stone-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-200'
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      <FieldError message={error} />
    </div>
  )
})
