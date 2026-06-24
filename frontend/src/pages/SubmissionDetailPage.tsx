import { Link, useParams } from 'react-router-dom'
import { useSubmission } from '../features/forms/queries'

export function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const { data: submission, isLoading, isError } = useSubmission(submissionId ?? '')

  if (isLoading) {
    return <p className="p-6 text-slate-500">Loading submission…</p>
  }

  if (isError || !submission) {
    return <p className="p-6 text-red-600">Submission not found.</p>
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link to={`/forms/${submission.formId}/submissions`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to submissions
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Submission</h1>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-white p-4 text-sm">
        <dt className="font-medium text-slate-500">ID</dt>
        <dd className="font-mono text-slate-900">{submission.id}</dd>

        <dt className="font-medium text-slate-500">Version</dt>
        <dd className="text-slate-900">v{submission.version}</dd>

        <dt className="font-medium text-slate-500">Submitted At</dt>
        <dd className="text-slate-900">{new Date(submission.submittedAt).toLocaleString()}</dd>
      </dl>

      <h2 className="mt-6 text-lg font-semibold text-slate-900">Data</h2>
      <pre className="mt-2 overflow-x-auto rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-900">
        {JSON.stringify(submission.data, null, 2)}
      </pre>
    </div>
  )
}
