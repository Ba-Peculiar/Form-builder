import { BuildingLoader } from './BuildingLoader'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/70 text-sm text-slate-500">
      <BuildingLoader />
      {label}
    </div>
  )
}
