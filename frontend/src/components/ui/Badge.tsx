import type { ReactNode } from 'react'

interface BadgeProps {
  variant: 'draft' | 'published' | 'neutral'
  children: ReactNode
}

const VARIANT_CLASSES: Record<BadgeProps['variant'], string> = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-success-50 text-success-700',
  neutral: 'bg-stone-100 text-stone-600',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}>{children}</span>
  )
}
