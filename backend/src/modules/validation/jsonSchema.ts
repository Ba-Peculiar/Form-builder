import type { FieldConfig } from '../../shared/types.js'

export interface JsonSchema {
  type: 'object'
  properties: Record<string, unknown>
  required: string[]
  additionalProperties: false
}

export function buildJsonSchema(fields: FieldConfig[]): JsonSchema {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const field of fields) {
    properties[field.id] = buildFieldSchema(field)
    if (field.required) {
      required.push(field.id)
    }
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  }
}

function buildFieldSchema(field: FieldConfig): Record<string, unknown> {
  switch (field.type) {
    case 'text':
    case 'textarea':
      return omitUndefined({
        type: 'string',
        minLength: field.minLength,
        maxLength: field.maxLength,
      })
    case 'email':
      return omitUndefined({
        type: 'string',
        format: 'email',
        minLength: field.minLength,
        maxLength: field.maxLength,
      })
    case 'date':
      return { type: 'string', format: 'date' }
    case 'number':
      return omitUndefined({
        type: 'number',
        minimum: field.min,
        maximum: field.max,
      })
    case 'select':
      return { type: 'string', enum: field.options ?? [] }
    case 'checkbox':
      return { type: 'boolean' }
  }
}

function omitUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T
}
