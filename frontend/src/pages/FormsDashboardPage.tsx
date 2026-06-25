import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Alert, Badge, Card, ConfirmDialog, EmptyState, IconButton, LoadingState, useToast } from '../components/ui'
import { useCreateForm, useDeleteForm, useForms } from '../features/forms/queries'
import type { FormSummary } from '../types/form'

const GRADIENTS = [
  'from-violet-400 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-indigo-400 to-violet-600',
]

function gradientForId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return GRADIENTS[hash % GRADIENTS.length]
}

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
      <section>
        <h2 className="mb-3 text-sm font-medium text-stone-600">Start a new form</h2>
        <button
          type="button"
          onClick={handleCreateBlank}
          disabled={createForm.isPending}
          className="flex w-40 flex-col items-center gap-2 disabled:opacity-50"
        >
          <span className="flex h-28 w-40 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <Plus className="h-9 w-9 text-accent-600" />
          </span>
          <span className="text-sm text-stone-700">Blank form</span>
        </button>
        {createForm.isError && (
          <div className="mt-3 max-w-sm">
            <Alert variant="error">{createForm.error.message}</Alert>
          </div>
        )}
      </section>

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
        <FormPreviewThumbnail formId={form.id} />
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

function FormPreviewThumbnail({ formId }: { formId: string }) {
  return (
    <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${gradientForId(formId)}`}>
      <FileText className="h-10 w-10 text-white/90" />
    </div>
  )
}
