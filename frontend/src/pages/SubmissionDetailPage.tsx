import { Link, useParams } from 'react-router-dom'
import { Alert, Badge, Card, LoadingState } from '../components/ui'
import { useSubmission } from '../features/forms/queries'
import { formatFullDate } from '../lib/formatDate'

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const { data: submission, isLoading, isError } = useSubmission(submissionId ?? '')

  if (isLoading) {
    return <LoadingState label="Loading response…" />
  }

  if (isError || !submission) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Alert variant="error">Response not found.</Alert>
      </div>
    )
  }

  const entries = Object.entries(submission.data)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to={`/forms/${submission.formId}/submissions`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to responses
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Response</h1>
        <Badge variant="neutral">v{submission.version}</Badge>
      </div>
      <p className="mt-1 font-mono text-xs text-slate-400">{submission.id}</p>
      <p className="mt-1 text-sm text-slate-500">{formatFullDate(submission.submittedAt)}</p>

      <Card className="mt-6" padding="none">
        {entries.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">This response has no data.</p>
        ) : (
          <dl className="divide-y divide-slate-100">
            {entries.map(([key, value]) => (
              <div key={key} className="p-4">
                <dt className="text-sm font-medium text-slate-500">{humanizeKey(key)}</dt>
                <dd className="mt-1 text-sm text-slate-900">{formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </div>
  )
}
