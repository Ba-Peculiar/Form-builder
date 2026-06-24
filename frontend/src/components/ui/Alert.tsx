import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children?: ReactNode
}

const VARIANT_CONFIG = {
  success: { className: 'bg-success-50 text-success-700', icon: CheckCircle2 },
  error: { className: 'bg-danger-50 text-danger-700', icon: XCircle },
  warning: { className: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
  info: { className: 'bg-accent-50 text-accent-700', icon: Info },
} as const

export function Alert({ variant, title, children }: AlertProps) {
  const { className, icon: Icon } = VARIANT_CONFIG[variant]

  return (
    <div className={`flex gap-2 rounded-md px-4 py-3 text-sm ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
      </div>
    </div>
  )
}
