import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiError } from '../../lib/api'
import type {
  CreateFormInput,
  CreateFormResponse,
  CreateSubmissionResponse,
  FormDetail,
  FormSummary,
  PublicForm,
  PublishFormResponse,
  SubmissionDetail,
  SubmissionSummary,
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

export function usePublicForm(formId: string) {
  return useQuery({
    queryKey: ['public-forms', formId] as const,
    queryFn: () => api.get<PublicForm>(`/public/forms/${formId}`),
    enabled: Boolean(formId),
  })
}

export function useCreateSubmission(formId: string) {
  return useMutation<CreateSubmissionResponse, ApiError, Record<string, unknown>>({
    mutationFn: (data) => api.post<CreateSubmissionResponse>(`/forms/${formId}/submissions`, data),
  })
}

export function useSubmissions(formId: string) {
  return useQuery({
    queryKey: ['forms', formId, 'submissions'] as const,
    queryFn: () => api.get<SubmissionSummary[]>(`/forms/${formId}/submissions`),
    enabled: Boolean(formId),
  })
}

export function useSubmission(submissionId: string) {
  return useQuery({
    queryKey: ['submissions', submissionId] as const,
    queryFn: () => api.get<SubmissionDetail>(`/submissions/${submissionId}`),
    enabled: Boolean(submissionId),
  })
}

export function usePublishForm(formId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post<PublishFormResponse>(`/forms/${formId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formsKey })
      queryClient.invalidateQueries({ queryKey: formKey(formId) })
    },
  })
}
