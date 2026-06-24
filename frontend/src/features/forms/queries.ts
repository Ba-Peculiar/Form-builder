import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type {
  CreateFormInput,
  CreateFormResponse,
  FormDetail,
  FormSummary,
  UpdateFormInput,
} from '../../types/form'

const formsKey = ['forms'] as const
const formKey = (formId: string) => ['forms', formId] as const

export function useForms() {
  return useQuery({
    queryKey: formsKey,
    queryFn: () => api.get<FormSummary[]>('/forms'),
  })
}

export function useForm(formId: string) {
  return useQuery({
    queryKey: formKey(formId),
    queryFn: () => api.get<FormDetail>(`/forms/${formId}`),
    enabled: Boolean(formId),
  })
}

export function useCreateForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateFormInput) => api.post<CreateFormResponse>('/forms', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formsKey })
    },
  })
}

export function useUpdateForm(formId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateFormInput) =>
      api.put<{ message: string }>(`/forms/${formId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formsKey })
      queryClient.invalidateQueries({ queryKey: formKey(formId) })
    },
  })
}
