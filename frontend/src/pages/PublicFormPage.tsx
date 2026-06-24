import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Share2 } from 'lucide-react'
import { Alert, Button, Card, LoadingState } from '../components/ui'
import { FormRenderer, type RendererLayout } from '../components/FormRenderer'
import { useCreateSubmission, usePublicForm } from '../features/forms/queries'

export function PublicFormPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form, isLoading, isError } = usePublicForm(formId ?? '')
  const createSubmission = useCreateSubmission(formId ?? '')
  const [layout, setLayout] = useState<RendererLayout>('standard')
  const [copied, setCopied] = useState(false)

  function handleShareLink() {
    navigator.clipboard.writeText(window.location.href)
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
        <Alert variant="error">This form is not published or does not exist.</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to forms
      </Link>

      <div className="mt-4 h-2 rounded-t-xl bg-accent-600" />
      <div className="flex items-center justify-between rounded-b-xl border border-t-0 border-slate-200 bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{form.title}</h1>
          {form.description && <p className="mt-1 text-slate-600">{form.description}</p>}
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
              layout={layout}
              fieldErrors={fieldErrors}
              onSubmit={(data) => createSubmission.mutate(data)}
            />
          </Card>
        ) : (
          <FormRenderer
            fields={form.schema.fields}
            layout={layout}
            fieldErrors={fieldErrors}
            onSubmit={(data) => createSubmission.mutate(data)}
          />
        )}
      </div>

      {createSubmission.isSuccess && (
        <div className="mt-4">
          <Alert variant="success">Submission received. ID: {createSubmission.data.submissionId}</Alert>
        </div>
      )}

      {createSubmission.isError && (
        <div className="mt-4">
          <Alert variant="error">{createSubmission.error.message}</Alert>
        </div>
      )}
    </div>
  )
}
