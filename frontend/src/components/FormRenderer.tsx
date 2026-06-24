import { useForm } from 'react-hook-form'
import type { FieldConfig } from '../types/form'
import { FieldRenderer } from './FieldRenderer'

export type RendererLayout = 'standard' | 'compact'

interface FormRendererProps {
  fields: FieldConfig[]
  layout: RendererLayout
  onSubmit: (data: Record<string, unknown>) => void
  submitLabel?: string
}

export function FormRenderer({ fields, layout, onSubmit, submitLabel = 'Submit' }: FormRendererProps) {
  const { register, handleSubmit } = useForm<Record<string, unknown>>()

  const sortedFields = [...fields].sort((a, b) => a.order - b.order)
  const containerClass =
    layout === 'compact' ? 'flex flex-row flex-wrap items-end gap-4' : 'flex flex-col gap-4'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={containerClass}>
      {sortedFields.map((field) => (
        <div key={field.id} className={layout === 'compact' ? 'min-w-[180px]' : undefined}>
          <FieldRenderer field={field} register={register} />
        </div>
      ))}
      <button
        type="submit"
        className="h-fit self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {submitLabel}
      </button>
    </form>
  )
}
