import { Link, useNavigate } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { Alert, Badge, Card, EmptyState, LoadingState } from '../components/ui'
import { useCreateForm, useForms } from '../features/forms/queries'
import type { FormSummary } from '../types/form'

export function FormsDashboardPage() {
  const navigate = useNavigate()
  const { data: forms, isLoading, isError } = useForms()
  const createForm = useCreateForm()

  function handleCreateBlank() {
    createForm.mutate({ title: 'Untitled form' }, { onSuccess: (form) => navigate(`/forms/${form.id}`) })
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <section>
        <h2 className="mb-3 text-sm font-medium text-slate-600">Start a new form</h2>
        <button
          type="button"
          onClick={handleCreateBlank}
          disabled={createForm.isPending}
          className="flex w-40 flex-col items-center gap-2 disabled:opacity-50"
        >
          <span className="flex h-28 w-40 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <Plus className="h-9 w-9 text-accent-600" />
          </span>
          <span className="text-sm text-slate-700">Blank form</span>
        </button>
        {createForm.isError && (
          <div className="mt-3 max-w-sm">
            <Alert variant="error">{createForm.error.message}</Alert>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-slate-600">Your forms</h2>

        {isLoading && <LoadingState label="Loading forms…" />}
        {isError && <Alert variant="error">Failed to load forms.</Alert>}

        {forms && forms.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No forms yet"
            description='Click "Blank form" above to create your first one.'
          />
        )}

        {forms && forms.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {forms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function FormCard({ form }: { form: FormSummary }) {
  return (
    <Card padding="none" className="overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/forms/${form.id}`} className="block">
        <FormPreviewThumbnail />
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 p-3">
        <Link to={`/forms/${form.id}`} className="truncate text-sm font-medium text-slate-900">
          {form.title}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {form.currentVersion && <Badge variant="neutral">v{form.currentVersion}</Badge>}
          <Badge variant={form.status === 'PUBLISHED' ? 'published' : 'draft'}>{form.status}</Badge>
        </div>
      </div>
      {form.status === 'PUBLISHED' && (
        <div className="border-t border-slate-100 px-3 py-2">
          <Link
            to={`/public/forms/${form.id}`}
            className="text-xs font-medium text-accent-600 hover:text-accent-700"
          >
            View public form →
          </Link>
        </div>
      )}
    </Card>
  )
}

function FormPreviewThumbnail() {
  return (
    <div className="flex h-28 flex-col gap-1.5 bg-accent-50 p-3">
      <div className="h-1.5 w-2/3 rounded bg-accent-300" />
      <div className="mt-1 h-1 w-full rounded bg-white" />
      <div className="h-1 w-5/6 rounded bg-white" />
      <div className="h-1 w-4/6 rounded bg-white" />
      <div className="mt-auto h-2 w-10 rounded bg-accent-300" />
    </div>
  )
}
