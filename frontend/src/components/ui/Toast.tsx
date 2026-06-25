import { useCallback, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card } from './Card'
import { ToastContext, type ToastVariant } from './ToastContext'

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    const id = nextId++
    setToast({ id, variant, message })
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, 2000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <Card className="flex w-full max-w-sm flex-col items-center gap-3 py-8 text-center">
            {toast.variant === 'success' ? (
              <CheckCircle2 className="h-10 w-10 text-success-600" />
            ) : (
              <XCircle className="h-10 w-10 text-danger-600" />
            )}
            <p className="text-base font-medium text-stone-900">{toast.message}</p>
          </Card>
        </div>
      )}
    </ToastContext.Provider>
  )
}
