import { createRequire } from 'node:module'
import { Ajv, type ErrorObject } from 'ajv'

// ajv-formats ships ESM type declarations that resolve incorrectly under
// NodeNext (the default import collapses to the module namespace type),
// while its actual runtime export is a plain CJS function. Loading it via
// createRequire sidesteps that broken interop instead of fighting it.
const require = createRequire(import.meta.url)
const addFormats = require('ajv-formats') as (ajv: Ajv) => Ajv
import { buildJsonSchema } from './jsonSchema.js'
import type { FieldConfig } from '../../shared/types.js'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export interface FieldErrorDetail {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: FieldErrorDetail[]
}

export function validateSubmission(fields: FieldConfig[], data: unknown): ValidationResult {
  const schema = buildJsonSchema(fields)
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (valid) {
    return { valid: true, errors: [] }
  }

  const fieldsById = new Map(fields.map((field) => [field.id, field]))
  const errors = (validate.errors ?? []).map((error) => formatError(error, fieldsById))

  return { valid: false, errors }
}

function formatError(error: ErrorObject, fieldsById: Map<string, FieldConfig>): FieldErrorDetail {
  if (error.keyword === 'required') {
    const fieldId = error.params.missingProperty as string
    const field = fieldsById.get(fieldId)
    return { field: fieldId, message: `${field?.label ?? fieldId} is required` }
  }

  if (error.keyword === 'additionalProperties') {
    const fieldId = error.params.additionalProperty as string
    return { field: fieldId, message: `Unknown field "${fieldId}"` }
  }

  const fieldId = error.instancePath.replace(/^\//, '')
  const field = fieldsById.get(fieldId)

  switch (error.keyword) {
    case 'minLength':
      return { field: fieldId, message: `Minimum length is ${error.params.limit}` }
    case 'maxLength':
      return { field: fieldId, message: `Maximum length is ${error.params.limit}` }
    case 'minimum':
      return { field: fieldId, message: `Minimum value is ${error.params.limit}` }
    case 'maximum':
      return { field: fieldId, message: `Maximum value is ${error.params.limit}` }
    case 'format':
      return error.params.format === 'email'
        ? { field: fieldId, message: 'Invalid email format' }
        : { field: fieldId, message: `Invalid ${error.params.format} format` }
    case 'enum':
      return { field: fieldId, message: `${field?.label ?? fieldId} must be one of the allowed options` }
    case 'pattern':
      return { field: fieldId, message: `${field?.label ?? fieldId} must contain only digits` }
    case 'type':
      return { field: fieldId, message: `${field?.label ?? fieldId} has an invalid value` }
    default:
      return { field: fieldId, message: error.message ?? 'Invalid value' }
  }
}
