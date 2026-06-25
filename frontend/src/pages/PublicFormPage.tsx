import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Button, Card, LoadingState, useToast } from '../components/ui'
import { FormRenderer, type RendererLayout } from '../components/FormRenderer'
import { useCreateSubmission, usePublicForm } from '../features/forms/queries'

export function PublicFormPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form, isLoading, isError } = usePublicForm(formId ?? '')
  const createSubmission = useCreateSubmission(formId ?? '')
  const [layout, setLayout] = useState<RendererLayout>('standard')
  const { showToast } = useToast()

  function handleSubmit(data: Record<string, unknown>) {
    createSubmission.mutate(data, {
      onSuccess: () => showToast('success', 'Submission received'),
      onError: (error) => showToast('error', error.message),
    })
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
      <div className="h-2 rounded-t-xl bg-accent-600" />
      <div className="flex items-center justify-between rounded-b-xl border border-t-0 border-stone-200 bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{form.title}</h1>
          {form.description && <p className="mt-1 text-stone-600">{form.description}</p>}
        </div>

        <div className="flex gap-2">
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
