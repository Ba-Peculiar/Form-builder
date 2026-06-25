import { Link, useParams } from 'react-router-dom'
import { ChevronRight, FileText, Inbox } from 'lucide-react'
import { FormTabs } from '../components/FormTabs'
import { Alert, Badge, Card, EmptyState, LoadingState } from '../components/ui'
import { useForm, useSubmissions } from '../features/forms/queries'
import { formatRelativeTime } from '../lib/formatDate'

export function SubmissionListPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form } = useForm(formId ?? '')
  const { data: submissions, isLoading, isError } = useSubmissions(formId ?? '')

  return (
    <div className="mx-auto max-w-3xl p-6">
      <FormTabs
        formId={formId ?? ''}
        active="responses"
        formHref={form?.status === 'PUBLISHED' ? `/forms/${formId}/view` : undefined}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Responses</h1>
          {form && <p className="mt-1 text-sm text-slate-500">{form.title}</p>}
        </div>

        {submissions && submissions.length > 0 && (
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-semibold text-accent-600">{submissions.length}</p>
            <p className="text-xs text-slate-500">{submissions.length === 1 ? 'response' : 'responses'}</p>
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
        <div className="mt-6 space-y-2">
          {submissions.map((submission) => (
            <Link key={submission.id} to={`/submissions/${submission.id}`} className="block">
              <Card padding="sm" className="flex items-center justify-between transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-mono text-sm text-slate-900">{submission.id.slice(0, 8)}…</p>
                    <p className="text-xs text-slate-500">{formatRelativeTime(submission.submittedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">v{submission.version}</Badge>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
