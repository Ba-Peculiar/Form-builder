import type { UseFormRegister } from 'react-hook-form'
import { CalendarDays, ChevronDown, Hash, Mail } from 'lucide-react'
import { FieldError } from './ui'
import type { FieldConfig } from '../types/form'

interface FieldRendererProps {
  field: FieldConfig
  register: UseFormRegister<Record<string, unknown>>
  error?: string
  compact?: boolean
}

export function FieldRenderer({ field, register, error, compact }: FieldRendererProps) {
  const showLabel = field.type !== 'checkbox'

  return (
    <div className="flex flex-col">
      {showLabel && (
        <label htmlFor={field.id} className="mb-1 text-sm font-medium text-stone-700">
          {field.label}
          {field.required && <span className="text-danger-600"> *</span>}
        </label>
      )}
      <FieldInput field={field} register={register} error={error} compact={compact} />
      <FieldError message={error} />
    </div>
  )
}

function inputClass(error: string | undefined, padding: string, compact?: boolean) {
  const size = compact ? 'rounded-xl border py-3 text-sm focus:outline-none' : 'rounded-lg border py-2 text-sm focus:outline-none'
  const tone = error
    ? 'border-danger-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-200'
    : compact
      ? 'border-stone-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-200'
      : 'border-stone-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-200'
  return `${size} ${padding} ${tone}`
}

function FieldInput({ field, register, error, compact }: FieldRendererProps) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={field.id}
          required={field.required}
          rows={compact ? 4 : 3}
          className={`w-full resize-none ${compact ? 'bg-white' : 'bg-stone-50'} ${inputClass(error, 'pl-3 pr-3', compact)}`}
          {...register(field.id)}
        />
      )

    case 'number':
      return (
        <div className="relative">
          <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id={field.id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required={field.required}
            className={`w-full ${inputClass(error, 'pl-9 pr-3', compact)}`}
            {...register(field.id)}
          />
        </div>
      )

    case 'email':
      return (
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id={field.id}
            type="email"
            required={field.required}
            className={`w-full ${inputClass(error, 'pl-9 pr-3', compact)}`}
            {...register(field.id)}
          />
        </div>
      )

    case 'date':
      return (
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id={field.id}
            type="date"
            required={field.required}
            className={`w-full ${inputClass(error, 'pl-9 pr-3', compact)}`}
            {...register(field.id)}
          />
        </div>
      )

    case 'select':
      return (
        <div className="relative">
          <select
            id={field.id}
            required={field.required}
            className={`w-full appearance-none ${inputClass(error, 'pl-3 pr-9', compact)}`}
            {...register(field.id)}
          >
            <option value="">Select…</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        </div>
      )

    case 'checkbox':
      return (
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            id={field.id}
            type="checkbox"
            className="h-4 w-4 rounded accent-accent-600"
            {...register(field.id)}
          />
          {field.label}
          {field.required && <span className="text-danger-600"> *</span>}
        </label>
      )

    case 'text':
    default:
      return (
        <input
          id={field.id}
          type="text"
          required={field.required}
          className={`w-full ${inputClass(error, 'pl-3 pr-3', compact)}`}
          {...register(field.id)}
        />
      )
  }
}
