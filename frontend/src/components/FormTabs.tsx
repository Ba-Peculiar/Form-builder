import { Link } from 'react-router-dom'

interface FormTabsProps {
  formId: string
  active: 'questions' | 'responses'
  formHref?: string
}

const ACTIVE_CLASS = 'border-b-2 border-accent-600 px-1 pb-2 text-accent-700'
const INACTIVE_CLASS = 'px-1 pb-2 text-stone-500 hover:text-stone-700'

export function FormTabs({ formId, active, formHref }: FormTabsProps) {
  return (
    <div className="mb-4 flex gap-6 border-b border-stone-200 text-sm font-medium">
      <Link to={formHref ?? `/forms/${formId}`} className={active === 'questions' ? ACTIVE_CLASS : INACTIVE_CLASS}>
        Form
      </Link>
      <Link to={`/forms/${formId}/submissions`} className={active === 'responses' ? ACTIVE_CLASS : INACTIVE_CLASS}>
        Submissions
      </Link>
    </div>
  )
}
