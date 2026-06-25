import { useForm } from 'react-hook-form'
import { Button, Card } from './ui'
import type { FieldConfig } from '../types/form'
import { FieldRenderer } from './FieldRenderer'

export type RendererLayout = 'standard' | 'compact'

interface FormRendererProps {
  fields: FieldConfig[]
  layout: RendererLayout
  onSubmit: (data: Record<string, unknown>) => void
  submitLabel?: string
  fieldErrors?: Record<string, string>
}

const WIDE_FIELD_TYPES = new Set(['textarea', 'checkbox'])

export function FormRenderer({ fields, layout, onSubmit, submitLabel = 'Submit', fieldErrors }: FormRendererProps) {
  const { register, handleSubmit } = useForm<Record<string, unknown>>()

  const sortedFields = [...fields].sort((a, b) => a.order - b.order)

  if (layout === 'compact') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sortedFields.map((field) => (
          <div key={field.id} className={WIDE_FIELD_TYPES.has(field.type) ? 'sm:col-span-2' : ''}>
            <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} compact />
          </div>
        ))}
        <div className="flex justify-center sm:col-span-2">
          <button
            type="submit"
            className="w-full max-w-xs rounded-full bg-accent-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {sortedFields.map((field) => (
        <Card key={field.id} padding="sm">
          <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} />
        </Card>
      ))}
      <Button type="submit" className="h-fit self-start">
        {submitLabel}
      </Button>
    </form>
  )
}
