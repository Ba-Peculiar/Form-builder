import { Spinner } from './Spinner'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-6 text-sm text-slate-500">
      <Spinner size="sm" />
      {label}
    </div>
  )
}
