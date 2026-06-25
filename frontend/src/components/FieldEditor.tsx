import { useState, type ReactNode } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, Plus, X } from 'lucide-react'
import { Button, Card, ConfirmDialog, IconButton, Select, Switch, TextInput } from './ui'
import type { FieldConfig, FieldGroup, FieldType } from '../types/form'

const UNGROUPED_ID = '__ungrouped__'

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

function findContainerOf(id: string, containers: Map<string, FieldConfig[]>): string | undefined {
  if (containers.has(id)) return id
  for (const [containerId, items] of containers) {
    if (items.some((field) => field.id === id)) return containerId
  }
  return undefined
}

function renumberAllContainers(fields: FieldConfig[]): FieldConfig[] {
  const counters = new Map<string, number>()
  return fields.map((field) => {
    const key = field.groupId ?? UNGROUPED_ID
    const next = (counters.get(key) ?? 0) + 1
    counters.set(key, next)
    return { ...field, order: next }
  })
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const containers = buildContainers(fields, groups)
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order)

  function updateField(id: string, patch: Partial<FieldConfig>) {
    onFieldsChange(renumberAllContainers(fields.map((field) => (field.id === id ? { ...field, ...patch } : field))))
  }

  function updateLabel(id: string, label: string) {
    const newId = uniqueId(slugify(label), fields, id, 'field')
    updateField(id, { label, id: newId })
  }

  function addField() {
    const label = 'New Field'
    const id = uniqueId(slugify(label), fields, null, 'field')
    const newField: FieldConfig = {
      id,
      label,
      type: 'text',
      order: fields.length + 1,
      required: false,
    }
    onFieldsChange(renumberAllContainers([...fields, newField]))
  }

  function removeField(id: string) {
    onFieldsChange(renumberAllContainers(fields.filter((field) => field.id !== id)))
  }

  function addGroup() {
    const label = 'New section'
    const id = uniqueId(slugify(label), groups, null, 'section')
    onGroupsChange([...groups, { id, label, order: groups.length + 1 }])
  }

  function updateGroupLabel(id: string, label: string) {
    onGroupsChange(groups.map((group) => (group.id === id ? { ...group, label } : group)))
  }

  function moveGroup(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= sortedGroups.length) return
    const next = arrayMove(sortedGroups, index, newIndex)
    onGroupsChange(next.map((group, i) => ({ ...group, order: i + 1 })))
  }

  function deleteGroup(id: string) {
    onGroupsChange(groups.filter((group) => group.id !== id))
    onFieldsChange(fields.map((field) => (field.groupId === id ? { ...field, groupId: undefined } : field)))
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    const activeContainer = findContainerOf(activeId, containers)
    const overContainer = findContainerOf(overId, containers)
    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    onFieldsChange(
      fields.map((field) =>
        field.id === activeId
          ? { ...field, groupId: overContainer === UNGROUPED_ID ? undefined : overContainer }
          : field,
      ),
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // onDragOver may already have moved the field's groupId, so re-derive
    // containers fresh from the latest fields/groups before finalizing.
    const liveContainers = buildContainers(fields, groups)
    const overContainer = findContainerOf(overId, liveContainers)
    if (!overContainer) return

    const items = liveContainers.get(overContainer)!
    const oldIndex = items.findIndex((field) => field.id === activeId)
    if (oldIndex === -1) return
    const newIndex = overId === overContainer ? items.length - 1 : items.findIndex((field) => field.id === overId)

    const reordered = newIndex === -1 || newIndex === oldIndex ? items : arrayMove(items, oldIndex, newIndex)
    const otherFields = fields.filter((field) => findContainerOf(field.id, liveContainers) !== overContainer)

    onFieldsChange(renumberAllContainers([...otherFields, ...reordered]))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {sortedGroups.map((group, index) => (
          <FieldGroupSection
            key={group.id}
            group={group}
            fields={containers.get(group.id) ?? []}
            groups={groups}
            disabled={disabled}
            isFirst={index === 0}
            isLast={index === sortedGroups.length - 1}
            onRename={(label) => updateGroupLabel(group.id, label)}
            onMoveUp={() => moveGroup(index, -1)}
            onMoveDown={() => moveGroup(index, 1)}
            onDelete={() => setGroupToDelete(group)}
            onFieldLabelChange={updateLabel}
            onFieldChange={updateField}
            onFieldRemove={removeField}
          />
        ))}

        <div className="space-y-3">
          {sortedGroups.length > 0 && (
            <span className="block text-sm font-medium text-stone-500">Ungrouped</span>
          )}
          <GroupDropZone id={UNGROUPED_ID}>
            <SortableContext
              items={(containers.get(UNGROUPED_ID) ?? []).map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {(containers.get(UNGROUPED_ID) ?? []).map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    groups={groups}
                    disabled={disabled}
                    onLabelChange={(label) => updateLabel(field.id, label)}
                    onChange={(patch) => updateField(field.id, patch)}
                    onRemove={() => removeField(field.id)}
                  />
                ))}
                {(containers.get(UNGROUPED_ID) ?? []).length === 0 && sortedGroups.length > 0 && (
                  <EmptyDropPlaceholder />
                )}
              </div>
            </SortableContext>
          </GroupDropZone>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={addField}
          disabled={disabled}
          className="flex-1 border-dashed border-accent-300 text-accent-700 hover:border-accent-400 hover:bg-accent-50"
        >
          <Plus className="h-4 w-4" />
          Add field
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={addGroup}
          disabled={disabled}
          className="flex-1 border-dashed border-accent-300 text-accent-700 hover:border-accent-400 hover:bg-accent-50"
        >
          <Plus className="h-4 w-4" />
          Add section
        </Button>
      </div>

      <ConfirmDialog
        open={groupToDelete !== null}
        title={`Delete "${groupToDelete?.label}"?`}
        description="Fields in this section will move to Ungrouped."
        confirmLabel="Delete"
        onConfirm={() => {
          if (groupToDelete) deleteGroup(groupToDelete.id)
          setGroupToDelete(null)
        }}
        onCancel={() => setGroupToDelete(null)}
      />
    </DndContext>
  )
}

function GroupDropZone({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={`rounded-lg transition-colors ${isOver ? 'bg-accent-50 ring-2 ring-accent-300' : ''}`}>
      {children}
    </div>
  )
}

function EmptyDropPlaceholder() {
  return (
    <p className="rounded-lg border border-dashed border-stone-300 px-3 py-6 text-center text-sm text-stone-400">
      Drop fields here
    </p>
  )
}

interface FieldGroupSectionProps {
  group: FieldGroup
  fields: FieldConfig[]
  groups: FieldGroup[]
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
}

function FieldGroupSection({
  group,
  fields,
  groups,
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

      <GroupDropZone id={group.id}>
        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field) => (
              <FieldRow
                key={field.id}
                field={field}
                groups={groups}
                disabled={disabled}
                onLabelChange={(label) => onFieldLabelChange(field.id, label)}
                onChange={(patch) => onFieldChange(field.id, patch)}
                onRemove={() => onFieldRemove(field.id)}
              />
            ))}
            {fields.length === 0 && <EmptyDropPlaceholder />}
          </div>
        </SortableContext>
      </GroupDropZone>
    </div>
  )
}

interface FieldRowProps {
  field: FieldConfig
  groups: FieldGroup[]
  disabled?: boolean
  onLabelChange: (label: string) => void
  onChange: (patch: Partial<FieldConfig>) => void
  onRemove: () => void
}

function FieldRow({ field, groups, disabled, onLabelChange, onChange, onRemove }: FieldRowProps) {
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

      {groups.length > 0 && (
        <div className="mt-3">
          <Select
            label="Section"
            value={field.groupId ?? UNGROUPED_ID}
            disabled={disabled}
            onChange={(e) =>
              onChange({ groupId: e.target.value === UNGROUPED_ID ? undefined : e.target.value })
            }
          >
            <option value={UNGROUPED_ID}>Ungrouped</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </Select>
        </div>
      )}

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
