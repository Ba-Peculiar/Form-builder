import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  label: string
  variant?: 'default' | 'danger'
}

const VARIANT_CLASSES: Record<NonNullable<IconButtonProps['variant']>, string> = {
  default: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  danger: 'text-danger-600 hover:bg-danger-50',
}

export function IconButton({ icon: Icon, label, variant = 'default', className = '', ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
