import { Link, useParams } from 'react-router-dom'
import { Code2 } from 'lucide-react'
import { Alert, Badge, Card, LoadingState } from '../components/ui'
import { useSubmission } from '../features/forms/queries'

export function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const { data: submission, isLoading, isError } = useSubmission(submissionId ?? '')

  if (isLoading) {
    return <LoadingState label="Loading submission…" />
  }

  if (isError || !submission) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Alert variant="error">Submission not found.</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to={`/forms/${submission.formId}/submissions`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to submissions
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Submission</h1>

      <Card className="mt-4">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="font-medium text-slate-500">ID</dt>
          <dd className="font-mono text-slate-900">{submission.id}</dd>

          <dt className="font-medium text-slate-500">Version</dt>
          <dd>
            <Badge variant="neutral">v{submission.version}</Badge>
          </dd>

          <dt className="font-medium text-slate-500">Submitted At</dt>
          <dd className="text-slate-900">{new Date(submission.submittedAt).toLocaleString()}</dd>
        </dl>
      </Card>

      <h2 className="mt-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Code2 className="h-4 w-4 text-slate-500" />
        Data
      </h2>
      <Card padding="sm" className="mt-2">
        <pre className="overflow-x-auto text-sm text-slate-900">{JSON.stringify(submission.data, null, 2)}</pre>
      </Card>
    </div>
  )
}
