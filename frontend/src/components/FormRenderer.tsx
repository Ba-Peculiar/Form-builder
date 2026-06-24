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

export function FormRenderer({ fields, layout, onSubmit, submitLabel = 'Submit', fieldErrors }: FormRendererProps) {
  const { register, handleSubmit } = useForm<Record<string, unknown>>()

  const sortedFields = [...fields].sort((a, b) => a.order - b.order)
  const containerClass =
    layout === 'compact' ? 'flex flex-row flex-wrap items-end gap-4' : 'flex flex-col gap-4'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={containerClass}>
      {sortedFields.map((field) => {
        const fieldNode = <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} />

        if (layout === 'compact') {
          return (
            <div key={field.id} className="min-w-[180px]">
              {fieldNode}
            </div>
          )
        }

        return (
          <Card key={field.id} padding="sm">
            {fieldNode}
          </Card>
        )
      })}
      <Button type="submit" className="h-fit self-start">
        {submitLabel}
      </Button>
    </form>
  )
}
