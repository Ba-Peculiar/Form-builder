import { forwardRef, type InputHTMLAttributes } from 'react'
import { FieldError } from './FieldError'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, hint, id, className = '', ...rest },
  ref,
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-200'
            : 'border-slate-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-200'
        } ${className}`}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
      <FieldError message={error} />
    </div>
  )
})
