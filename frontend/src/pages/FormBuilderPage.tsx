import { useEffect, useRef, useState } from 'react'
import { useForm as useReactHookForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { FieldEditor } from '../components/FieldEditor'
import { useForm, useUpdateForm } from '../features/forms/queries'
import type { FieldConfig, UpdateFormInput } from '../types/form'

interface BuilderFormValues {
  title: string
  description: string
}

export function FormBuilderPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form, isLoading, isError } = useForm(formId ?? '')
  const updateForm = useUpdateForm(formId ?? '')

  const [fields, setFields] = useState<FieldConfig[]>([])
  const initializedFor = useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<BuilderFormValues>()

  useEffect(() => {
    if (form && initializedFor.current !== form.id) {
      setFields(form.schema.fields)
      initializedFor.current = form.id
    }
  }, [form])

  if (isLoading) {
    return <p className="p-6 text-slate-500">Loading form…</p>
  }

  if (isError || !form) {
    return <p className="p-6 text-red-600">Form not found.</p>
  }

  const isReadOnly = form.status !== 'DRAFT'

  const onSubmit = (values: BuilderFormValues) => {
    const input: UpdateFormInput = {
      title: values.title,
      description: values.description || undefined,
      schema: { fields },
    }
    updateForm.mutate(input)
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to forms
      </Link>

      {isReadOnly && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
          This form is published and read-only.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              defaultValue={form.title}
              disabled={isReadOnly}
              {...register('title', { required: 'Title is required' })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              defaultValue={form.description ?? ''}
              disabled={isReadOnly}
              {...register('description')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Fields</h2>
          <FieldEditor fields={fields} onChange={setFields} disabled={isReadOnly} />
        </div>

        {updateForm.isError && (
          <p className="text-sm text-red-600">{updateForm.error.message}</p>
        )}
        {updateForm.isSuccess && (
          <p className="text-sm text-green-600">Form saved.</p>
        )}

        {!isReadOnly && (
          <button
            type="submit"
            disabled={updateForm.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {updateForm.isPending ? 'Saving…' : 'Save'}
          </button>
        )}
      </form>
    </div>
  )
}
