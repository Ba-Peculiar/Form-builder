import { ValidationError } from '../../shared/errors.js'
import type { FieldConfig, FieldGroup, FieldType } from '../../shared/types.js'

const ALLOWED_FIELD_TYPES: FieldType[] = [
  'text',
  'textarea',
  'number',
  'email',
  'date',
  'select',
  'checkbox',
]

const FIELD_ID_PATTERN = /^[a-zA-Z0-9_-]+$/

interface FieldErrorDetail {
  field: string
  message: string
}

export interface CreateFormInput {
  title: string
  description?: string
}

export interface UpdateFormInput {
  title: string
  description?: string
  fields?: FieldConfig[]
  groups?: FieldGroup[]
  ungroupedOrder?: number
}

export function validateCreateForm(body: unknown): CreateFormInput {
  const data = (body ?? {}) as Record<string, unknown>
  const errors: FieldErrorDetail[] = []

  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' })
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' })
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors)
  }

  return {
    title: (data.title as string).trim(),
    description: data.description as string | undefined,
  }
}

export function validateUpdateForm(body: unknown): UpdateFormInput {
  const data = (body ?? {}) as Record<string, unknown>
  const errors: FieldErrorDetail[] = []

  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' })
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' })
  }

  let fields: FieldConfig[] | undefined
  let groups: FieldGroup[] | undefined
  let ungroupedOrder: number | undefined

  if (data.schema !== undefined) {
    const schema = data.schema as Record<string, unknown>
    fields = validateFields(schema.fields, errors)
    if (schema.groups !== undefined) {
      groups = validateGroups(schema.groups, errors)
    }
    if (schema.ungroupedOrder !== undefined) {
      if (typeof schema.ungroupedOrder !== 'number' || !Number.isFinite(schema.ungroupedOrder)) {
        errors.push({ field: 'schema.ungroupedOrder', message: 'ungroupedOrder must be a number' })
      } else {
        ungroupedOrder = schema.ungroupedOrder
      }
    }
  }

  // This only checks consistency within this single request body, not against
  // a merged-with-existing-version final state - acceptable because the
  // frontend always sends fields and groups together on every save.
  if (fields) {
    const groupIds = new Set((groups ?? []).map((g) => g.id))
    fields.forEach((field, index) => {
      if (field.groupId !== undefined && !groupIds.has(field.groupId)) {
        errors.push({
          field: `schema.fields[${index}].groupId`,
          message: `Unknown group id "${field.groupId}"`,
        })
      }
    })
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors)
  }

  return {
    title: (data.title as string).trim(),
    description: data.description as string | undefined,
    fields,
    groups,
    ungroupedOrder,
  }
}

function validateFields(rawFields: unknown, errors: FieldErrorDetail[]): FieldConfig[] {
  if (!Array.isArray(rawFields)) {
    errors.push({ field: 'schema.fields', message: 'Fields must be an array' })
    return []
  }

  const seenIds = new Set<string>()
  const fields: FieldConfig[] = []

  rawFields.forEach((raw, index) => {
    const prefix = `schema.fields[${index}]`
    const field = (raw ?? {}) as Record<string, unknown>

    const id = field.id
    if (typeof id !== 'string' || !FIELD_ID_PATTERN.test(id)) {
      errors.push({
        field: `${prefix}.id`,
        message: 'Field id is required and must be alphanumeric (with - or _)',
      })
    } else if (seenIds.has(id)) {
      errors.push({ field: `${prefix}.id`, message: `Duplicate field id "${id}"` })
    } else {
      seenIds.add(id)
    }

    if (typeof field.label !== 'string' || field.label.trim().length === 0) {
      errors.push({ field: `${prefix}.label`, message: 'Field label is required' })
    }

    const type = field.type
    if (typeof type !== 'string' || !ALLOWED_FIELD_TYPES.includes(type as FieldType)) {
      errors.push({
        field: `${prefix}.type`,
        message: `Field type must be one of: ${ALLOWED_FIELD_TYPES.join(', ')}`,
      })
    }

    if (typeof field.order !== 'number' || !Number.isFinite(field.order)) {
      errors.push({ field: `${prefix}.order`, message: 'Field order must be a number' })
    }

    if (field.required !== undefined && typeof field.required !== 'boolean') {
      errors.push({ field: `${prefix}.required`, message: 'required must be a boolean' })
    }

    if (field.groupId !== undefined && typeof field.groupId !== 'string') {
      errors.push({ field: `${prefix}.groupId`, message: 'groupId must be a string' })
    }

    for (const key of ['minLength', 'maxLength', 'min', 'max'] as const) {
      if (field[key] !== undefined && typeof field[key] !== 'number') {
        errors.push({ field: `${prefix}.${key}`, message: `${key} must be a number` })
      }
    }

    if (type === 'select') {
      const options = field.options
      if (
        !Array.isArray(options) ||
        options.length === 0 ||
        !options.every((opt) => typeof opt === 'string' && opt.trim().length > 0)
      ) {
        errors.push({
          field: `${prefix}.options`,
          message: 'Select fields require a non-empty array of string options',
        })
      }
    }

    fields.push(field as unknown as FieldConfig)
  })

  return fields
}

function validateGroups(rawGroups: unknown, errors: FieldErrorDetail[]): FieldGroup[] {
  if (!Array.isArray(rawGroups)) {
    errors.push({ field: 'schema.groups', message: 'Groups must be an array' })
    return []
  }

  const seenIds = new Set<string>()
  const groups: FieldGroup[] = []

  rawGroups.forEach((raw, index) => {
    const prefix = `schema.groups[${index}]`
    const group = (raw ?? {}) as Record<string, unknown>

    const id = group.id
    if (typeof id !== 'string' || !FIELD_ID_PATTERN.test(id)) {
      errors.push({
        field: `${prefix}.id`,
        message: 'Group id is required and must be alphanumeric (with - or _)',
      })
    } else if (seenIds.has(id)) {
      errors.push({ field: `${prefix}.id`, message: `Duplicate group id "${id}"` })
    } else {
      seenIds.add(id)
    }

    if (typeof group.label !== 'string' || group.label.trim().length === 0) {
      errors.push({ field: `${prefix}.label`, message: 'Group label is required' })
    }

    if (typeof group.order !== 'number' || !Number.isFinite(group.order)) {
      errors.push({ field: `${prefix}.order`, message: 'Group order must be a number' })
    }

    groups.push(group as unknown as FieldGroup)
  })

  return groups
}
