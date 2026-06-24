import type { FieldConfig, FieldType } from '../types/form'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
]

function slugify(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function uniqueId(base: string, fields: FieldConfig[], skipIndex: number) {
  const used = new Set(fields.filter((_, i) => i !== skipIndex).map((f) => f.id))
  const safeBase = base || 'field'
  if (!used.has(safeBase)) return safeBase
  let suffix = 2
  while (used.has(`${safeBase}_${suffix}`)) suffix += 1
  return `${safeBase}_${suffix}`
}

interface FieldEditorProps {
  fields: FieldConfig[]
  onChange: (fields: FieldConfig[]) => void
  disabled?: boolean
}

export function FieldEditor({ fields, onChange, disabled }: FieldEditorProps) {
  function updateField(index: number, patch: Partial<FieldConfig>) {
    onChange(fields.map((field, i) => (i === index ? { ...field, ...patch } : field)))
  }

  function updateLabel(index: number, label: string) {
    updateField(index, { label, id: uniqueId(slugify(label), fields, index) })
  }

  function addField() {
    const label = 'New Field'
    const id = uniqueId(slugify(label), fields, -1)
    const newField: FieldConfig = {
      id,
      label,
      type: 'text',
      order: fields.length + 1,
      required: false,
    }
    onChange([...fields, newField])
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index).map((field, i) => ({ ...field, order: i + 1 })))
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= fields.length) return

    const next = [...fields]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next.map((field, i) => ({ ...field, order: i + 1 })))
  }

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <FieldRow
          key={field.id || index}
          field={field}
          index={index}
          total={fields.length}
          disabled={disabled}
          onLabelChange={(label) => updateLabel(index, label)}
          onChange={(patch) => updateField(index, patch)}
          onRemove={() => removeField(index)}
          onMove={(direction) => moveField(index, direction)}
        />
      ))}

      <button
        type="button"
        onClick={addField}
        disabled={disabled}
        className="rounded-md border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 disabled:opacity-50"
      >
        + Add field
      </button>
    </div>
  )
}

interface FieldRowProps {
  field: FieldConfig
  index: number
  total: number
  disabled?: boolean
  onLabelChange: (label: string) => void
  onChange: (patch: Partial<FieldConfig>) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}

function FieldRow({
  field,
  index,
  total,
  disabled,
  onLabelChange,
  onChange,
  onRemove,
  onMove,
}: FieldRowProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400">id: {field.id}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={disabled || index === 0}
            className="text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={disabled || index === total - 1}
            className="text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-30"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Label</label>
          <input
            value={field.label}
            disabled={disabled}
            onChange={(e) => onLabelChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Type</label>
          <select
            value={field.type}
            disabled={disabled}
            onChange={(e) => onChange({ type: e.target.value as FieldType })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {FIELD_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          id={`required-${field.id}`}
          type="checkbox"
          checked={field.required ?? false}
          disabled={disabled}
          onChange={(e) => onChange({ required: e.target.checked })}
        />
        <label htmlFor={`required-${field.id}`} className="text-sm text-slate-700">
          Required
        </label>
      </div>

      {(field.type === 'text' || field.type === 'textarea') && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField
            label="Min length"
            value={field.minLength}
            disabled={disabled}
            onChange={(value) => onChange({ minLength: value })}
          />
          <NumberField
            label="Max length"
            value={field.maxLength}
            disabled={disabled}
            onChange={(value) => onChange({ maxLength: value })}
          />
        </div>
      )}

      {field.type === 'number' && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField
            label="Min value"
            value={field.min}
            disabled={disabled}
            onChange={(value) => onChange({ min: value })}
          />
          <NumberField
            label="Max value"
            value={field.max}
            disabled={disabled}
            onChange={(value) => onChange({ max: value })}
          />
        </div>
      )}

      {field.type === 'select' && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-slate-700">
            Options (comma-separated)
          </label>
          <input
            value={(field.options ?? []).join(', ')}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                options: e.target.value
                  .split(',')
                  .map((opt) => opt.trim())
                  .filter((opt) => opt.length > 0),
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Option A, Option B, Option C"
          />
        </div>
      )}
    </div>
  )
}

function NumberField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value?: number
  disabled?: boolean
  onChange: (value: number | undefined) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  )
}
