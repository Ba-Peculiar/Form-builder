import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FormRenderer, type RendererLayout } from '../components/FormRenderer'
import { useCreateSubmission, usePublicForm } from '../features/forms/queries'

export function PublicFormPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form, isLoading, isError } = usePublicForm(formId ?? '')
  const createSubmission = useCreateSubmission(formId ?? '')
  const [layout, setLayout] = useState<RendererLayout>('standard')

  if (isLoading) {
    return <p className="p-6 text-slate-500">Loading form…</p>
  }

  if (isError || !form) {
    return <p className="p-6 text-red-600">This form is not published or does not exist.</p>
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to forms
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{form.title}</h1>
          {form.description && <p className="mt-1 text-slate-600">{form.description}</p>}
        </div>

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setLayout('standard')}
            className={`rounded-md px-3 py-1.5 font-medium ${
              layout === 'standard' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setLayout('compact')}
            className={`rounded-md px-3 py-1.5 font-medium ${
              layout === 'compact' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300'
            }`}
          >
            Compact
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-slate-200 bg-white p-6">
        <FormRenderer
          fields={form.schema.fields}
          layout={layout}
          onSubmit={(data) => createSubmission.mutate(data)}
        />
      </div>

      {createSubmission.isSuccess && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-800">
          Submission received. ID: {createSubmission.data.submissionId}
        </div>
      )}

      {createSubmission.isError && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">{createSubmission.error.message}</p>
          {createSubmission.error.errors && createSubmission.error.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {createSubmission.error.errors.map((fieldError, index) => (
                <li key={index}>
                  {fieldError.field}: {fieldError.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
