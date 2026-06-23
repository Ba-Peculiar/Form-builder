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
