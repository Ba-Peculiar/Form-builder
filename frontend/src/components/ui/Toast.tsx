import { useCallback, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { ToastContext, type ToastVariant } from './ToastContext'

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((variant: ToastVariant, message: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, variant, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg ${
              toast.variant === 'success' ? 'border-success-200 text-success-700' : 'border-danger-200 text-danger-700'
            }`}
          >
            {toast.variant === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
