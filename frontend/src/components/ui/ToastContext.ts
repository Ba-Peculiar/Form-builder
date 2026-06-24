import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error'

export interface ToastContextValue {
  showToast: (variant: ToastVariant, message: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
