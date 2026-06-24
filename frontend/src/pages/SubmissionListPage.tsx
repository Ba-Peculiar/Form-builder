import { Link, useParams } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { Alert, Badge, Card, EmptyState, LoadingState } from '../components/ui'
import { useForm, useSubmissions } from '../features/forms/queries'

export function SubmissionListPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form } = useForm(formId ?? '')
  const { data: submissions, isLoading, isError } = useSubmissions(formId ?? '')

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to={`/forms/${formId}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to form
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-slate-900">
        Submissions{form && ` for ${form.title}`}
      </h1>

      {isLoading && <LoadingState label="Loading submissions…" />}
      {isError && (
        <div className="mt-4">
          <Alert variant="error">Failed to load submissions.</Alert>
        </div>
      )}

      {submissions && submissions.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={Inbox}
            title="No submissions yet"
            description="Submissions will appear here once people fill out this form."
          />
        </div>
      )}

      {submissions && submissions.length > 0 && (
        <div className="mt-4 space-y-2">
          {submissions.map((submission) => (
            <Card key={submission.id} padding="sm" className="flex items-center justify-between hover:shadow-md transition-shadow">
              <Link to={`/submissions/${submission.id}`} className="font-mono text-sm text-slate-900">
                {submission.id}
              </Link>
              <span className="flex items-center gap-3 text-sm text-slate-500">
                <Badge variant="neutral">v{submission.version}</Badge>
                <span>{new Date(submission.submittedAt).toLocaleString()}</span>
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
