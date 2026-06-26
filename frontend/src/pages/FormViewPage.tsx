import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
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
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <Alert variant="error">Form not found.</Alert>
      </div>
    )
  }

  if (form.status !== 'PUBLISHED') {
    return <Navigate to={`/forms/${form.id}`} replace />
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <FormTabs formId={form.id} active="questions" formHref={`/forms/${form.id}/view`} />

      <div className="h-2 rounded-t-xl bg-accent-600" />
      <div className="flex flex-col gap-4 rounded-b-xl border border-t-0 border-stone-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-stone-900 sm:text-2xl">{form.title}</h1>
          {form.description && <p className="mt-1 text-sm text-stone-600 sm:text-base">{form.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
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
              layout={layout}
              fieldErrors={fieldErrors}
              onSubmit={handleSubmit}
            />
          </Card>
        ) : (
          <FormRenderer
            fields={form.schema.fields}
            groups={form.schema.groups}
            layout={layout}
            fieldErrors={fieldErrors}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
