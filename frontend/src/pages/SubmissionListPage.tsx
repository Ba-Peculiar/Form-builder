import { Link, useParams } from 'react-router-dom'
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

      {isLoading && <p className="mt-4 text-slate-500">Loading submissions…</p>}
      {isError && <p className="mt-4 text-red-600">Failed to load submissions.</p>}

      {submissions && submissions.length === 0 && (
        <p className="mt-4 text-slate-500">No submissions yet.</p>
      )}

      {submissions && submissions.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
          {submissions.map((submission) => (
            <li key={submission.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <Link to={`/submissions/${submission.id}`} className="font-mono text-sm text-slate-900">
                {submission.id}
              </Link>
              <span className="flex items-center gap-3 text-sm text-slate-500">
                <span>v{submission.version}</span>
                <span>{new Date(submission.submittedAt).toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
