import { useState } from 'react'
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
import { ChevronDown, ChevronUp, FolderPlus, GripVertical, Plus, X } from 'lucide-react'
import { Button, Card, ConfirmDialog, IconButton, Select, Switch, TextInput } from './ui'
import type { FieldConfig, FieldGroup, FieldType } from '../types/form'

const UNGROUPED_ID = '__ungrouped__'
const MAX_ORDER = 1_000_000

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

function uniqueId(base: string, items: { id: string }[], skipId: string | null, fallback: string) {
  const used = new Set(items.filter((item) => item.id !== skipId).map((item) => item.id))
  const safeBase = base || fallback
  if (!used.has(safeBase)) return safeBase
  let suffix = 2
  while (used.has(`${safeBase}_${suffix}`)) suffix += 1
  return `${safeBase}_${suffix}`
}

function buildContainers(fields: FieldConfig[], groups: FieldGroup[]) {
  const byGroup = new Map<string, FieldConfig[]>()
  byGroup.set(UNGROUPED_ID, [])
  for (const group of groups) byGroup.set(group.id, [])

  for (const field of fields) {
    const key = field.groupId && byGroup.has(field.groupId) ? field.groupId : UNGROUPED_ID
    byGroup.get(key)!.push(field)
  }
  for (const items of byGroup.values()) items.sort((a, b) => a.order - b.order)

  return byGroup
}

// Only renumber fields within their sections (grouped fields). Ungrouped fields
// carry their own globalOrder for inter-section positioning, which must not change here.
function renumberGroupedFields(fields: FieldConfig[]): FieldConfig[] {
  const counters = new Map<string, number>()
  return fields.map((field) => {
    if (!field.groupId) return field
    const next = (counters.get(field.groupId) ?? 0) + 1
    counters.set(field.groupId, next)
    return { ...field, order: next }
  })
}

type UnifiedEntry = { kind: 'group'; group: FieldGroup } | { kind: 'field'; field: FieldConfig }

function buildUnifiedOrder(fields: FieldConfig[], groups: FieldGroup[]): UnifiedEntry[] {
  const ungroupedFields = fields.filter((f) => !f.groupId)
  const entries: { entry: UnifiedEntry; key: number; tiebreak: number }[] = [
    ...groups.map((group) => ({ entry: { kind: 'group' as const, group }, key: group.order, tiebreak: 0 })),
    ...ungroupedFields.map((field) => ({
      entry: { kind: 'field' as const, field },
      key: field.globalOrder ?? MAX_ORDER,
      tiebreak: field.order,
    })),
  ]
  entries.sort((a, b) => a.key - b.key || a.tiebreak - b.tiebreak)
  return entries.map((e) => e.entry)
}

function renumberUnified(
  entries: UnifiedEntry[],
  allFields: FieldConfig[],
): { groups: FieldGroup[]; fields: FieldConfig[] } {
  const newGroups: FieldGroup[] = []
  const globalOrderMap = new Map<string, number>()

  entries.forEach((entry, index) => {
    if (entry.kind === 'group') {
      newGroups.push({ ...entry.group, order: index + 1 })
    } else {
      globalOrderMap.set(entry.field.id, index + 1)
    }
  })

  const newFields = allFields.map((field) => {
    const go = globalOrderMap.get(field.id)
    return go !== undefined ? { ...field, globalOrder: go } : field
  })

  return { groups: newGroups, fields: newFields }
}

interface FieldEditorProps {
  fields: FieldConfig[]
  groups: FieldGroup[]
  onFieldsChange: (fields: FieldConfig[]) => void
  onGroupsChange: (groups: FieldGroup[]) => void
  disabled?: boolean
}

export function FieldEditor({ fields, groups, onFieldsChange, onGroupsChange, disabled }: FieldEditorProps) {
  const [groupToDelete, setGroupToDelete] = useState<FieldGroup | null>(null)

  const containers = buildContainers(fields, groups)
  const unifiedOrder = buildUnifiedOrder(fields, groups)

  function applyUnified(entries: UnifiedEntry[], allFields: FieldConfig[] = fields) {
    const next = renumberUnified(entries, allFields)
    onGroupsChange(next.groups)
    onFieldsChange(next.fields)
  }

  function updateField(id: string, patch: Partial<FieldConfig>) {
    onFieldsChange(renumberGroupedFields(fields.map((field) => (field.id === id ? { ...field, ...patch } : field))))
  }

  function updateLabel(id: string, label: string) {
    const newId = uniqueId(slugify(label), fields, id, 'field')
    updateField(id, { label, id: newId })
  }

  function removeField(id: string) {
    const removedField = fields.find((f) => f.id === id)
    const newFields = fields.filter((f) => f.id !== id)
    if (removedField && !removedField.groupId) {
      const newUnified = unifiedOrder.filter((e) => e.kind !== 'field' || e.field.id !== id)
      applyUnified(newUnified, newFields)
    } else {
      onFieldsChange(renumberGroupedFields(newFields))
    }
  }

  function addFieldToContainer(containerId: string) {
    const label = 'New Field'
    const id = uniqueId(slugify(label), fields, null, 'field')
    const newField: FieldConfig = {
      id,
      label,
      type: 'text',
      order: fields.length + 1,
      groupId: containerId,
      required: false,
    }
    onFieldsChange(renumberGroupedFields([...fields, newField]))
  }

  function addUngroupedField() {
    const label = 'New Field'
    const id = uniqueId(slugify(label), fields, null, 'field')
    const newField: FieldConfig = {
      id,
      label,
      type: 'text',
      order: fields.filter((f) => !f.groupId).length + 1,
      globalOrder: 0,
      required: false,
    }
    const newAllFields = [...fields, newField]
    const newEntry: UnifiedEntry = { kind: 'field', field: newField }
    applyUnified([...unifiedOrder, newEntry], newAllFields)
  }

  function reorderContainer(containerId: string, reordered: FieldConfig[]) {
    const otherFields = fields.filter((field) => (field.groupId ?? UNGROUPED_ID) !== containerId)
    onFieldsChange(renumberGroupedFields([...otherFields, ...reordered]))
  }

  function addGroup() {
    const label = 'New section'
    const id = uniqueId(slugify(label), groups, null, 'section')
    const newEntry: UnifiedEntry = { kind: 'group', group: { id, label, order: 0 } }
    applyUnified([...unifiedOrder, newEntry])
  }

  function updateGroupLabel(id: string, label: string) {
    onGroupsChange(groups.map((group) => (group.id === id ? { ...group, label } : group)))
  }

  function moveEntry(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= unifiedOrder.length) return
    applyUnified(arrayMove(unifiedOrder, index, newIndex))
  }

  function deleteGroup(id: string) {
    const groupIndex = unifiedOrder.findIndex((e) => e.kind === 'group' && e.group.id === id)
    const releasedFields = fields.filter((f) => f.groupId === id)
    const releasedEntries: UnifiedEntry[] = releasedFields.map((f) => ({
      kind: 'field',
      field: { ...f, groupId: undefined },
    }))
    const newUnified = [
      ...unifiedOrder.slice(0, groupIndex),
      ...releasedEntries,
      ...unifiedOrder.slice(groupIndex + 1),
    ]
    const updatedFields = fields.map((f) => (f.groupId === id ? { ...f, groupId: undefined } : f))
    applyUnified(newUnified, updatedFields)
  }

  return (
    <div>
      <div className="space-y-6">
        {unifiedOrder.map((entry, index) =>
          entry.kind === 'group' ? (
            <FieldGroupSection
              key={entry.group.id}
              group={entry.group}
              fields={containers.get(entry.group.id) ?? []}
              disabled={disabled}
              isFirst={index === 0}
              isLast={index === unifiedOrder.length - 1}
              onRename={(label) => updateGroupLabel(entry.group.id, label)}
              onMoveUp={() => moveEntry(index, -1)}
              onMoveDown={() => moveEntry(index, 1)}
              onDelete={() => setGroupToDelete(entry.group)}
              onFieldLabelChange={updateLabel}
              onFieldChange={updateField}
              onFieldRemove={removeField}
              onReorder={reorderContainer}
              onAddField={addFieldToContainer}
            />
          ) : (
            <UngroupedFieldEntry
              key={index}
              field={entry.field}
              disabled={disabled}
              isFirst={index === 0}
              isLast={index === unifiedOrder.length - 1}
              onMoveUp={() => moveEntry(index, -1)}
              onMoveDown={() => moveEntry(index, 1)}
              onLabelChange={(label) => updateLabel(entry.field.id, label)}
              onChange={(patch) => updateField(entry.field.id, patch)}
              onRemove={() => removeField(entry.field.id)}
            />
          ),
        )}
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={addUngroupedField}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add field
        </button>
        <button
          type="button"
          onClick={addGroup}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FolderPlus className="h-4 w-4" />
          Add section
        </button>
      </div>

      <ConfirmDialog
        open={groupToDelete !== null}
        title={`Delete "${groupToDelete?.label}"?`}
        description="Fields in this section will become individual ungrouped fields."
        confirmLabel="Delete"
        onConfirm={() => {
          if (groupToDelete) deleteGroup(groupToDelete.id)
          setGroupToDelete(null)
        }}
        onCancel={() => setGroupToDelete(null)}
      />
    </div>
  )
}

interface FieldGroupSectionProps {
  group: FieldGroup
  fields: FieldConfig[]
  disabled?: boolean
  isFirst: boolean
  isLast: boolean
  onRename: (label: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onFieldLabelChange: (id: string, label: string) => void
  onFieldChange: (id: string, patch: Partial<FieldConfig>) => void
  onFieldRemove: (id: string) => void
  onReorder: (containerId: string, reordered: FieldConfig[]) => void
  onAddField: (containerId: string) => void
}

function FieldGroupSection({
  group,
  fields,
  disabled,
  isFirst,
  isLast,
  onRename,
  onMoveUp,
  onMoveDown,
  onDelete,
  onFieldLabelChange,
  onFieldChange,
  onFieldRemove,
  onReorder,
  onAddField,
}: FieldGroupSectionProps) {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-stone-300 p-4">
      <div className="flex items-center justify-between gap-2">
        <TextInput
          aria-label="Section label"
          value={group.label}
          disabled={disabled}
          onChange={(e) => onRename(e.target.value)}
          className="max-w-xs border-none px-0 text-base font-semibold"
        />
        <div className="flex items-center gap-1">
          <IconButton icon={ChevronUp} label="Move section up" onClick={onMoveUp} disabled={disabled || isFirst} />
          <IconButton
            icon={ChevronDown}
            label="Move section down"
            onClick={onMoveDown}
            disabled={disabled || isLast}
          />
          <IconButton icon={X} label="Delete section" variant="danger" onClick={onDelete} disabled={disabled} />
        </div>
      </div>

      <SortableFieldList
        containerId={group.id}
        fields={fields}
        disabled={disabled}
        onFieldLabelChange={onFieldLabelChange}
        onFieldChange={onFieldChange}
        onFieldRemove={onFieldRemove}
        onReorder={onReorder}
        onAddField={onAddField}
      />
    </div>
  )
}

// Standalone ungrouped field — no DnD, uses up/down buttons for global reordering.
interface UngroupedFieldEntryProps {
  field: FieldConfig
  disabled?: boolean
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onLabelChange: (label: string) => void
  onChange: (patch: Partial<FieldConfig>) => void
  onRemove: () => void
}

function UngroupedFieldEntry({
  field,
  disabled,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onLabelChange,
  onChange,
  onRemove,
}: UngroupedFieldEntryProps) {
  return (
    <Card className="group focus-within:border-l-4 focus-within:border-l-accent-600 focus-within:ring-2 focus-within:ring-accent-200">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-stone-400">id: {field.id}</span>
        <div className="flex items-center gap-1">
          <IconButton icon={ChevronUp} label="Move field up" onClick={onMoveUp} disabled={disabled || isFirst} />
          <IconButton icon={ChevronDown} label="Move field down" onClick={onMoveDown} disabled={disabled || isLast} />
          <IconButton icon={X} label="Remove field" variant="danger" onClick={onRemove} disabled={disabled} />
        </div>
      </div>
      <FieldBody field={field} disabled={disabled} onLabelChange={onLabelChange} onChange={onChange} />
    </Card>
  )
}

interface SortableFieldListProps {
  containerId: string
  fields: FieldConfig[]
  disabled?: boolean
  onFieldLabelChange: (id: string, label: string) => void
  onFieldChange: (id: string, patch: Partial<FieldConfig>) => void
  onFieldRemove: (id: string) => void
  onReorder: (containerId: string, reordered: FieldConfig[]) => void
  onAddField: (containerId: string) => void
}

function SortableFieldList({
  containerId,
  fields,
  disabled,
  onFieldLabelChange,
  onFieldChange,
  onFieldRemove,
  onReorder,
  onAddField,
}: SortableFieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((field) => field.id === active.id)
    const newIndex = fields.findIndex((field) => field.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(containerId, arrayMove(fields, oldIndex, newIndex))
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <FieldRow
                key={index}
                field={field}
                disabled={disabled}
                onLabelChange={(label) => onFieldLabelChange(field.id, label)}
                onChange={(patch) => onFieldChange(field.id, patch)}
                onRemove={() => onFieldRemove(field.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAddField(containerId)}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add field
        </button>
      </div>
    </div>
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
            className="cursor-grab touch-none text-stone-400 hover:text-stone-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs text-stone-400">id: {field.id}</span>
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <IconButton icon={X} label="Remove field" variant="danger" onClick={onRemove} disabled={disabled} />
        </div>
      </div>
      <FieldBody field={field} disabled={disabled} onLabelChange={onLabelChange} onChange={onChange} />
    </Card>
  )
}

// Shared field editing controls used by both FieldRow (inside sections) and UngroupedFieldEntry.
function FieldBody({
  field,
  disabled,
  onLabelChange,
  onChange,
}: {
  field: FieldConfig
  disabled?: boolean
  onLabelChange: (label: string) => void
  onChange: (patch: Partial<FieldConfig>) => void
}) {
  return (
    <>
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
          <span className="block text-sm font-medium text-stone-700">Options</span>
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
    </>
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
