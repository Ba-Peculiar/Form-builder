export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'date'
  | 'select'
  | 'checkbox'

export interface FieldGroup {
  id: string
  label: string
  order: number
}

export interface FieldConfig {
  id: string
  label: string
  type: FieldType
  order: number
  groupId?: string
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
  groups?: FieldGroup[]
  ungroupedOrder?: number
}
