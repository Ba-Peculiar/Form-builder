import type { UseFormRegister } from 'react-hook-form'
import type { FieldConfig } from '../types/form'

interface FieldRendererProps {
  field: FieldConfig
  register: UseFormRegister<Record<string, unknown>>
}

export function FieldRenderer({ field, register }: FieldRendererProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={field.id} className="mb-1 text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-600"> *</span>}
      </label>
      <FieldInput field={field} register={register} />
    </div>
  )
}

function FieldInput({ field, register }: FieldRendererProps) {
  const baseClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm'

  switch (field.type) {
    case 'textarea':
      return (
        <textarea id={field.id} required={field.required} className={baseClass} {...register(field.id)} />
      )
    case 'number':
      return (
        <input
          id={field.id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required={field.required}
          className={baseClass}
          {...register(field.id)}
        />
      )
    case 'email':
      return (
        <input id={field.id} type="email" required={field.required} className={baseClass} {...register(field.id)} />
      )
    case 'date':
      return (
        <input id={field.id} type="date" required={field.required} className={baseClass} {...register(field.id)} />
      )
    case 'select':
      return (
        <select id={field.id} required={field.required} className={baseClass} {...register(field.id)}>
          <option value="">Select…</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    case 'checkbox':
      return (
        <input id={field.id} type="checkbox" className="h-4 w-4 self-start" {...register(field.id)} />
      )
    case 'text':
    default:
      return (
        <input id={field.id} type="text" required={field.required} className={baseClass} {...register(field.id)} />
      )
  }
}
