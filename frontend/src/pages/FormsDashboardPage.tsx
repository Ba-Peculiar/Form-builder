import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateForm, useForms } from '../features/forms/queries'
import type { CreateFormInput } from '../types/form'

export function FormsDashboardPage() {
  const { data: forms, isLoading, isError } = useForms()
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Forms</h1>
        <button
          type="button"
          onClick={() => setIsCreating((value) => !value)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {isCreating ? 'Cancel' : 'New Form'}
        </button>
      </div>

      {isCreating && <CreateFormPanel onDone={() => setIsCreating(false)} />}

      {isLoading && <p className="text-slate-500">Loading forms…</p>}
      {isError && <p className="text-red-600">Failed to load forms.</p>}

      {forms && forms.length === 0 && (
        <p className="text-slate-500">No forms yet. Create your first one.</p>
      )}

      {forms && forms.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
          {forms.map((form) => (
            <li key={form.id}>
              <Link
                to={`/forms/${form.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{form.title}</span>
                <span className="flex items-center gap-3 text-sm text-slate-500">
                  {form.currentVersion && <span>v{form.currentVersion}</span>}
                  <StatusBadge status={form.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' }) {
  const className =
    status === 'PUBLISHED'
      ? 'bg-green-100 text-green-700'
      : 'bg-amber-100 text-amber-700'

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {status}
    </span>
  )
}

function CreateFormPanel({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate()
  const createForm = useCreateForm()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormInput>()

  const onSubmit = (input: CreateFormInput) => {
    createForm.mutate(input, {
      onSuccess: (form) => {
        onDone()
        navigate(`/forms/${form.id}`)
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-6 space-y-3 rounded-md border border-slate-200 bg-white p-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Customer Registration"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          {...register('description')}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Collect customer information"
        />
      </div>

      {createForm.isError && (
        <p className="text-sm text-red-600">{createForm.error.message}</p>
      )}

      <button
        type="submit"
        disabled={createForm.isPending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {createForm.isPending ? 'Creating…' : 'Create'}
      </button>
    </form>
  )
}
