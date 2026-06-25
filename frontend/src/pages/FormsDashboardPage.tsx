import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList, FileText, Plus, Trash2 } from 'lucide-react'
import { Alert, Badge, Card, ConfirmDialog, EmptyState, IconButton, LoadingState, useToast } from '../components/ui'
import { useCreateForm, useDeleteForm, useForms } from '../features/forms/queries'
import type { FormSummary } from '../types/form'

export function FormsDashboardPage() {
  const navigate = useNavigate()
  const { data: forms, isLoading, isError } = useForms()
  const createForm = useCreateForm()
  const deleteForm = useDeleteForm()
  const [formToDelete, setFormToDelete] = useState<FormSummary | null>(null)
  const { showToast } = useToast()

  function handleCreateBlank() {
    createForm.mutate({ title: 'Untitled form' }, { onSuccess: (form) => navigate(`/forms/${form.id}`) })
  }

  function handleConfirmDelete() {
    if (!formToDelete) return
    deleteForm.mutate(formToDelete.id, {
      onSuccess: () => {
        showToast('success', 'Form deleted')
        setFormToDelete(null)
      },
      onError: (error) => showToast('error', error.message),
    })
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <DashboardHero onCreate={handleCreateBlank} isCreating={createForm.isPending} />

      {createForm.isError && (
        <div className="mt-4 max-w-sm">
          <Alert variant="error">{createForm.error.message}</Alert>
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-stone-600">Your forms</h2>

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
              <FormCard key={form.id} form={form} onDelete={() => setFormToDelete(form)} />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={formToDelete !== null}
        title={`Delete "${formToDelete?.title}"?`}
        description="This will also delete all of its responses. This can't be undone."
        confirmLabel="Delete"
        isLoading={deleteForm.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFormToDelete(null)}
      />
    </div>
  )
}

function DashboardHero({
  onCreate,
  isCreating,
}: {
  onCreate: () => void
  isCreating: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-700 via-accent-600 to-accent-400 px-8 py-12 shadow-sm sm:px-12">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl" />
      <ClipboardList
        className="pointer-events-none absolute -right-4 top-1/2 hidden h-48 w-48 -translate-y-1/2 text-white/10 sm:block"
        strokeWidth={1.5}
      />

      <div className="relative max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-100">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          Create a new form, or pick up a draft
        </h1>
        <p className="mt-3 text-accent-50/90">
          Build a form from scratch and publish it in minutes, or jump back into one you&apos;ve already started.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCreate}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-accent-700 shadow-sm transition-colors hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? 'Creating…' : 'Create a new form'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormCard({ form, onDelete }: { form: FormSummary; onDelete: () => void }) {
  const viewHref = form.status === 'PUBLISHED' ? `/forms/${form.id}/view` : `/forms/${form.id}`

  return (
    <Card padding="none" className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton
          icon={Trash2}
          label="Delete form"
          variant="danger"
          className="bg-white/90 shadow-sm"
          onClick={onDelete}
        />
      </div>

      <Link to={viewHref} className="block">
        <FormPreviewThumbnail />
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-stone-200 p-3">
        <Link to={viewHref} className="truncate text-sm font-medium text-stone-900">
          {form.title}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {form.currentVersion && <Badge variant="neutral">v{form.currentVersion}</Badge>}
          <Badge variant={form.status === 'PUBLISHED' ? 'published' : 'draft'}>{form.status}</Badge>
        </div>
      </div>
      {form.status === 'PUBLISHED' && (
        <div className="border-t border-stone-100 px-3 py-2">
          <Link
            to={`/forms/${form.id}/submissions`}
            className="text-xs font-medium text-accent-600 hover:text-accent-700"
          >
            View responses →
          </Link>
        </div>
      )}
    </Card>
  )
}

function FormPreviewThumbnail() {
  return (
    <div className="flex h-28 items-center justify-center bg-[#f1e3d1]">
      <FileText className="h-10 w-10 text-accent-700/40" />
    </div>
  )
}
