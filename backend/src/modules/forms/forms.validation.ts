import { ValidationError } from '../../shared/errors.js'
import type { FieldConfig, FieldType } from '../../shared/types.js'

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

  if (data.schema !== undefined) {
    const schema = data.schema as Record<string, unknown>
    fields = validateFields(schema.fields, errors)
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors)
  }

  return {
    title: (data.title as string).trim(),
    description: data.description as string | undefined,
    fields,
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
