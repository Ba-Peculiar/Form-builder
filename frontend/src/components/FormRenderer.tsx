import { useForm } from 'react-hook-form'
import { Button, Card } from './ui'
import type { FieldConfig, FieldGroup } from '../types/form'
import { FieldRenderer } from './FieldRenderer'

export type RendererLayout = 'standard' | 'compact'

interface FormRendererProps {
  fields: FieldConfig[]
  groups?: FieldGroup[]
  layout: RendererLayout
  onSubmit: (data: Record<string, unknown>) => void
  submitLabel?: string
  fieldErrors?: Record<string, string>
}

const WIDE_FIELD_TYPES = new Set(['textarea', 'checkbox'])

function groupFields(fields: FieldConfig[], groups: FieldGroup[] = []) {
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order)
  const byId = new Map(sortedGroups.map((group) => [group.id, group]))
  const buckets = new Map<string, FieldConfig[]>(sortedGroups.map((group) => [group.id, []]))
  const ungrouped: FieldConfig[] = []

  for (const field of fields) {
    if (field.groupId && byId.has(field.groupId)) {
      buckets.get(field.groupId)!.push(field)
    } else {
      ungrouped.push(field)
    }
  }
  for (const bucket of buckets.values()) bucket.sort((a, b) => a.order - b.order)
  ungrouped.sort((a, b) => a.order - b.order)

  return {
    sections: sortedGroups.map((group) => ({ group, fields: buckets.get(group.id)! })),
    ungrouped,
  }
}

function SectionHeading({ label }: { label: string }) {
  return (
    <h2 className="border-l-4 border-accent-600 pl-3 text-base font-semibold uppercase tracking-wide text-stone-900">
      {label}
    </h2>
  )
}

export function FormRenderer({
  fields,
  groups,
  layout,
  onSubmit,
  submitLabel = 'Submit',
  fieldErrors,
}: FormRendererProps) {
  const { register, handleSubmit } = useForm<Record<string, unknown>>()
  const { sections, ungrouped } = groupFields(fields, groups)

  if (layout === 'compact') {
    if (sections.length === 0) {
      return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ungrouped.map((field) => (
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {sections.map(({ group, fields: groupFieldsList }, index) => (
          <div key={group.id} className={`space-y-3 ${index > 0 ? 'border-t-2 border-stone-300 pt-6' : ''}`}>
            <SectionHeading label={group.label} />
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {groupFieldsList.map((field) => (
                  <div key={field.id} className={WIDE_FIELD_TYPES.has(field.type) ? 'sm:col-span-2' : ''}>
                    <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} compact />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {ungrouped.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
              sections.length > 0 ? 'border-t-2 border-stone-300 pt-6' : ''
            }`}
          >
            {ungrouped.map((field) => (
              <div key={field.id} className={WIDE_FIELD_TYPES.has(field.type) ? 'sm:col-span-2' : ''}>
                <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} compact />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
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

  if (sections.length === 0) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {ungrouped.map((field) => (
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {sections.map(({ group, fields: groupFieldsList }, index) => (
        <div key={group.id} className={`space-y-4 ${index > 0 ? 'border-t-2 border-stone-300 pt-6' : ''}`}>
          <SectionHeading label={group.label} />
          {groupFieldsList.map((field) => (
            <Card key={field.id} padding="sm">
              <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} />
            </Card>
          ))}
        </div>
      ))}

      {ungrouped.length > 0 && (
        <div className={`space-y-4 ${sections.length > 0 ? 'border-t-2 border-stone-300 pt-6' : ''}`}>
          {ungrouped.map((field) => (
            <Card key={field.id} padding="sm">
              <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} />
            </Card>
          ))}
        </div>
      )}

      <Button type="submit" className="h-fit self-start">
        {submitLabel}
      </Button>
    </form>
  )
}
