import { Link } from 'react-router-dom'

interface FormTabsProps {
  formId: string
  active: 'questions' | 'responses'
}

const ACTIVE_CLASS = 'border-b-2 border-accent-600 px-1 pb-2 text-accent-700'
const INACTIVE_CLASS = 'px-1 pb-2 text-slate-500 hover:text-slate-700'

export function FormTabs({ formId, active }: FormTabsProps) {
  return (
    <div className="mb-4 flex gap-6 border-b border-slate-200 text-sm font-medium">
      <Link to={`/forms/${formId}`} className={active === 'questions' ? ACTIVE_CLASS : INACTIVE_CLASS}>
        Form
      </Link>
      <Link to={`/forms/${formId}/submissions`} className={active === 'responses' ? ACTIVE_CLASS : INACTIVE_CLASS}>
        Submissions
      </Link>
    </div>
  )
}
