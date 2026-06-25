import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormTabs } from '../components/FormTabs'
import { FormRenderer, type RendererLayout } from '../components/FormRenderer'
import { Alert, Badge, Button, Card, LoadingState } from '../components/ui'
import { useForm, useSubmission } from '../features/forms/queries'
import { formatFullDate } from '../lib/formatDate'

export function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const { data: submission, isLoading, isError } = useSubmission(submissionId ?? '')
  const { data: form, isLoading: isFormLoading } = useForm(submission?.formId ?? '')
  const [layout, setLayout] = useState<RendererLayout>('standard')

  if (isLoading || isFormLoading) {
    return <LoadingState label="Loading response…" />
  }

  if (isError || !submission || !form) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Alert variant="error">Response not found.</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <FormTabs formId={submission.formId} active="responses" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Response</h1>
          <p className="mt-1 font-mono text-xs text-stone-400">{submission.id}</p>
          <p className="mt-1 text-sm text-stone-500">{formatFullDate(submission.submittedAt)}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="neutral">v{submission.version}</Badge>
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
              defaultValues={submission.data}
              readOnly
            />
          </Card>
        ) : (
          <FormRenderer
            fields={form.schema.fields}
            groups={form.schema.groups}
            layout={layout}
            defaultValues={submission.data}
            readOnly
          />
        )}
      </div>
    </div>
  )
}
