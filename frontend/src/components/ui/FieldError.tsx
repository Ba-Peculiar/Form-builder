import { AlertCircle } from 'lucide-react'

interface FieldErrorProps {
  message?: string
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null

  return (
    <p className="mt-1 flex items-center gap-1 text-sm text-danger-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  )
}
