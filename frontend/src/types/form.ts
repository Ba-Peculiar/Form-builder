export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'date'
  | 'select'
  | 'checkbox'

export interface FieldConfig {
  id: string
  label: string
  type: FieldType
  order: number
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  options?: string[]
}

export interface FormSchema {
  title: string
  fields: FieldConfig[]
}

export type FormStatus = 'DRAFT' | 'PUBLISHED'

export interface FormSummary {
  id: string
  title: string
  status: FormStatus
  currentVersion: number | null
}

export interface FormDetail {
  id: string
  title: string
  description: string | null
  status: FormStatus
  currentVersion: number | null
  schema: FormSchema
}

export interface CreateFormInput {
  title: string
  description?: string
}

export interface CreateFormResponse {
  id: string
  title: string
  description: string | null
  status: FormStatus
  currentVersion: number | null
  createdAt: string
}

export interface UpdateFormInput {
  title: string
  description?: string
  schema: {
    fields: FieldConfig[]
  }
}

export interface PublishFormResponse {
  formId: string
  version: number
  status: FormStatus
  publicUrl: string
}

export interface PublicForm {
  formId: string
  version: number
  title: string
  description: string | null
  schema: {
    fields: FieldConfig[]
  }
}
