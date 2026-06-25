import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Check, Share2 } from 'lucide-react'
import { Alert, Button, Card, LoadingState, useToast } from '../components/ui'
import { FormTabs } from '../components/FormTabs'
import { FormRenderer, type RendererLayout } from '../components/FormRenderer'
import { useCreateSubmission, useForm } from '../features/forms/queries'

export function FormViewPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form, isLoading, isError } = useForm(formId ?? '')
  const createSubmission = useCreateSubmission(formId ?? '')
  const [layout, setLayout] = useState<RendererLayout>('standard')
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  function handleSubmit(data: Record<string, unknown>) {
    createSubmission.mutate(data, {
      onSuccess: () => showToast('success', 'Submission received'),
      onError: (error) => showToast('error', error.message),
    })
  }

  function handleShareLink() {
    const publicUrl = `${window.location.origin}/public/forms/${formId}`
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fieldErrors = useMemo(() => {
    const entries = createSubmission.error?.errors ?? []
    return Object.fromEntries(entries.map((entry) => [entry.field, entry.message]))
  }, [createSubmission.error])

  if (isLoading) {
    return <LoadingState label="Loading form…" />
  }

  if (isError || !form) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Alert variant="error">Form not found.</Alert>
      </div>
    )
  }

  if (form.status !== 'PUBLISHED') {
    return <Navigate to={`/forms/${form.id}`} replace />
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to forms
      </Link>

      <div className="mt-4">
        <FormTabs formId={form.id} active="questions" formHref={`/forms/${form.id}/view`} />
      </div>

      <div className="h-2 rounded-t-xl bg-accent-600" />
      <div className="flex items-center justify-between rounded-b-xl border border-t-0 border-stone-200 bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{form.title}</h1>
          {form.description && <p className="mt-1 text-stone-600">{form.description}</p>}
        </div>

        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={handleShareLink}>
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Share link'}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={layout === 'standard' ? 'primary' : 'secondary'}
            onClick={() => setLayout('standard')}
          >
            Standard
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layout === 'compact' ? 'primary' : 'secondary'}
            onClick={() => setLayout('compact')}
          >
            Compact
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {layout === 'compact' ? (
          <Card>
            <FormRenderer
              fields={form.schema.fields}
              groups={form.schema.groups}
              ungroupedOrder={form.schema.ungroupedOrder}
              layout={layout}
              fieldErrors={fieldErrors}
              onSubmit={handleSubmit}
            />
          </Card>
        ) : (
          <FormRenderer
            fields={form.schema.fields}
            groups={form.schema.groups}
            ungroupedOrder={form.schema.ungroupedOrder}
            layout={layout}
            fieldErrors={fieldErrors}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
