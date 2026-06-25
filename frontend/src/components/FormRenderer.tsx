import { useForm } from 'react-hook-form'
import { Button, Card } from './ui'
import type { FieldConfig, FieldGroup } from '../types/form'
import { FieldRenderer } from './FieldRenderer'

export type RendererLayout = 'standard' | 'compact'

interface FormRendererProps {
  fields: FieldConfig[]
  groups?: FieldGroup[]
  ungroupedOrder?: number
  layout: RendererLayout
  onSubmit?: (data: Record<string, unknown>) => void
  submitLabel?: string
  fieldErrors?: Record<string, string>
  defaultValues?: Record<string, unknown>
  readOnly?: boolean
}

const WIDE_FIELD_TYPES = new Set(['textarea', 'checkbox'])

type SectionItem =
  | { kind: 'group'; group: FieldGroup; fields: FieldConfig[] }
  | { kind: 'ungrouped'; fields: FieldConfig[] }

function groupFields(fields: FieldConfig[], groups: FieldGroup[] = [], ungroupedOrder?: number) {
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

  const sections = sortedGroups.map((group) => ({ group, fields: buckets.get(group.id)! }))

  const items: SectionItem[] = [
    ...sections.map((section) => ({ kind: 'group' as const, group: section.group, fields: section.fields })),
    { kind: 'ungrouped' as const, fields: ungrouped },
  ].sort((a, b) => {
    const keyA = a.kind === 'group' ? a.group.order : ungroupedOrder ?? Infinity
    const keyB = b.kind === 'group' ? b.group.order : ungroupedOrder ?? Infinity
    return keyA - keyB
  })

  return { sections, ungrouped, items }
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
  ungroupedOrder,
  layout,
  onSubmit,
  submitLabel = 'Submit',
  fieldErrors,
  defaultValues,
  readOnly,
}: FormRendererProps) {
  const { register, handleSubmit } = useForm<Record<string, unknown>>({ defaultValues })
  const { sections, ungrouped, items } = groupFields(fields, groups, ungroupedOrder)
  const submit = handleSubmit(onSubmit ?? (() => {}))

  if (layout === 'compact') {
    if (sections.length === 0) {
      return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ungrouped.map((field) => (
            <div key={field.id} className={WIDE_FIELD_TYPES.has(field.type) ? 'sm:col-span-2' : ''}>
              <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} compact disabled={readOnly} />
            </div>
          ))}
          {!readOnly && (
            <div className="flex justify-center sm:col-span-2">
              <button
                type="submit"
                className="w-full max-w-xs rounded-full bg-accent-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitLabel}
              </button>
            </div>
          )}
        </form>
      )
    }

    return (
      <form onSubmit={submit} className="flex flex-col gap-6">
        {items.map((item) =>
          item.kind === 'group' ? (
            <div key={item.group.id} className="space-y-4 rounded-xl border border-stone-300 bg-white p-6 shadow-sm">
              <SectionHeading label={item.group.label} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {item.fields.map((field) => (
                  <div key={field.id} className={WIDE_FIELD_TYPES.has(field.type) ? 'sm:col-span-2' : ''}>
                    <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} compact disabled={readOnly} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            item.fields.length > 0 && (
              <div key="ungrouped" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {item.fields.map((field) => (
                  <div key={field.id} className={WIDE_FIELD_TYPES.has(field.type) ? 'sm:col-span-2' : ''}>
                    <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} compact disabled={readOnly} />
                  </div>
                ))}
              </div>
            )
          ),
        )}

        {!readOnly && (
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full max-w-xs rounded-full bg-accent-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    )
  }

  if (sections.length === 0) {
    return (
      <form onSubmit={submit} className="flex flex-col gap-4">
        {ungrouped.map((field) => (
          <Card key={field.id} padding="sm">
            <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} disabled={readOnly} />
          </Card>
        ))}
        {!readOnly && (
          <Button type="submit" className="h-fit self-start">
            {submitLabel}
          </Button>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {items.map((item) =>
        item.kind === 'group' ? (
          <div key={item.group.id} className="space-y-4 rounded-xl border border-stone-300 bg-white p-6 shadow-sm">
            <SectionHeading label={item.group.label} />
            {item.fields.map((field) => (
              <Card key={field.id} padding="sm">
                <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} disabled={readOnly} />
              </Card>
            ))}
          </div>
        ) : (
          item.fields.length > 0 && (
            <div key="ungrouped" className="space-y-4">
              {item.fields.map((field) => (
                <Card key={field.id} padding="sm">
                  <FieldRenderer field={field} register={register} error={fieldErrors?.[field.id]} disabled={readOnly} />
                </Card>
              ))}
            </div>
          )
        ),
      )}

      {!readOnly && (
        <Button type="submit" className="h-fit self-start">
          {submitLabel}
        </Button>
      )}
    </form>
  )
}
