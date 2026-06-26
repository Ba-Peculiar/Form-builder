import { Link, useParams } from 'react-router-dom'
import { FileCheck, Inbox } from 'lucide-react'
import { FormTabs } from '../components/FormTabs'
import { Alert, Badge, Card, EmptyState, LoadingState } from '../components/ui'
import { useForm, useSubmissions } from '../features/forms/queries'
import { formatRelativeTime } from '../lib/formatDate'
import type { SubmissionSummary } from '../types/form'

export function SubmissionListPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form } = useForm(formId ?? '')
  const { data: submissions, isLoading, isError } = useSubmissions(formId ?? '')

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <FormTabs
        formId={formId ?? ''}
        active="responses"
        formHref={form?.status === 'PUBLISHED' ? `/forms/${formId}/view` : undefined}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Responses</h1>
          {form && <p className="mt-1 text-sm text-stone-500">{form.title}</p>}
        </div>

        {submissions && submissions.length > 0 && (
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-semibold text-accent-600">{submissions.length}</p>
            <p className="text-xs text-stone-500">{submissions.length === 1 ? 'response' : 'responses'}</p>
          </Card>
        )}
      </div>

      {isLoading && <LoadingState label="Loading responses…" />}
      {isError && (
        <div className="mt-4">
          <Alert variant="error">Failed to load responses.</Alert>
        </div>
      )}

      {submissions && submissions.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={Inbox}
            title="No responses yet"
            description="Responses will appear here once people fill out this form."
          />
        </div>
      )}

      {submissions && submissions.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {submissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubmissionCard({ submission }: { submission: SubmissionSummary }) {
  return (
    <Link to={`/submissions/${submission.id}`} className="block">
      <Card padding="none" className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex h-28 items-center justify-center bg-[#f1e3d1]">
          <FileCheck className="h-10 w-10 text-accent-700/40" />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-stone-200 p-3">
          <p className="truncate font-mono text-xs text-stone-900">{submission.id.slice(0, 8)}…</p>
          <Badge variant="neutral">v{submission.version}</Badge>
        </div>
        <div className="border-t border-stone-100 px-3 py-2">
          <p className="text-xs text-stone-500">{formatRelativeTime(submission.submittedAt)}</p>
        </div>
      </Card>
    </Link>
  )
}
