import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, X } from 'lucide-react'
import { Button, Card, IconButton, Select, Switch, TextInput } from './ui'
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((field) => field.id === active.id)
    const newIndex = fields.findIndex((field) => field.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const next = arrayMove(fields, oldIndex, newIndex)
    onChange(next.map((field, i) => ({ ...field, order: i + 1 })))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <FieldRow
              key={index}
              field={field}
              disabled={disabled}
              onLabelChange={(label) => updateLabel(index, label)}
              onChange={(patch) => updateField(index, patch)}
              onRemove={() => removeField(index)}
            />
          ))}
        </div>
      </SortableContext>

      <Button
        type="button"
        variant="secondary"
        onClick={addField}
        disabled={disabled}
        className="mt-3 w-full border-dashed border-accent-300 text-accent-700 hover:border-accent-400 hover:bg-accent-50"
      >
        <Plus className="h-4 w-4" />
        Add field
      </Button>
    </DndContext>
  )
}

interface FieldRowProps {
  field: FieldConfig
  disabled?: boolean
  onLabelChange: (label: string) => void
  onChange: (patch: Partial<FieldConfig>) => void
  onRemove: () => void
}

function FieldRow({ field, disabled, onLabelChange, onChange, onRemove }: FieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group focus-within:border-l-4 focus-within:border-l-accent-600 focus-within:ring-2 focus-within:ring-accent-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={disabled}
            aria-label="Drag to reorder"
            className="cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs text-slate-400">id: {field.id}</span>
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <IconButton icon={X} label="Remove field" variant="danger" onClick={onRemove} disabled={disabled} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Label"
          value={field.label}
          disabled={disabled}
          onChange={(e) => onLabelChange(e.target.value)}
        />

        <Select
          label="Type"
          value={field.type}
          disabled={disabled}
          onChange={(e) => onChange({ type: e.target.value as FieldType })}
        >
          {FIELD_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-3">
        <Switch
          checked={field.required ?? false}
          onChange={(checked) => onChange({ required: checked })}
          disabled={disabled}
          label="Required"
        />
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
            label="Min digits"
            value={field.min}
            disabled={disabled}
            onChange={(value) => onChange({ min: value })}
          />
          <NumberField
            label="Max digits"
            value={field.max}
            disabled={disabled}
            onChange={(value) => onChange({ max: value })}
          />
        </div>
      )}

      {field.type === 'select' && (
        <div className="mt-3 space-y-2">
          <span className="block text-sm font-medium text-slate-700">Options</span>
          {(field.options ?? []).map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-2">
              <div className="flex-1">
                <TextInput
                  value={option}
                  disabled={disabled}
                  placeholder={`Option ${optIndex + 1}`}
                  onChange={(e) => {
                    const next = [...(field.options ?? [])]
                    next[optIndex] = e.target.value
                    onChange({ options: next })
                  }}
                />
              </div>
              <IconButton
                icon={X}
                label="Remove option"
                variant="danger"
                disabled={disabled}
                onClick={() => onChange({ options: (field.options ?? []).filter((_, i) => i !== optIndex) })}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange({ options: [...(field.options ?? []), ''] })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add option
          </Button>
        </div>
      )}
    </Card>
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
    <TextInput
      type="number"
      label={label}
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
    />
  )
}
