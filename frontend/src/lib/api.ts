const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export interface FieldErrorDetail {
  field: string
  message: string
}

export class ApiError extends Error {
  errors?: FieldErrorDetail[]

  constructor(message: string, errors?: FieldErrorDetail[]) {
    super(message)
    this.errors = errors
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new ApiError(payload?.error ?? 'Request failed', payload?.errors)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
