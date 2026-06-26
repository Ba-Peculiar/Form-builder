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
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <Alert variant="error">This form is not published or does not exist.</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="h-2 rounded-t-xl bg-accent-600" />
      <div className="flex flex-col gap-4 rounded-b-xl border border-t-0 border-stone-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-stone-900 sm:text-2xl">{form.title}</h1>
          {form.description && <p className="mt-1 text-sm text-stone-600 sm:text-base">{form.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
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
