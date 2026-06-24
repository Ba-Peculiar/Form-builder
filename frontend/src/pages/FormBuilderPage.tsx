import { useEffect, useRef, useState } from 'react'
import { useForm as useReactHookForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Copy, ExternalLink } from 'lucide-react'
import { FieldEditor } from '../components/FieldEditor'
import { FormTabs } from '../components/FormTabs'
import { Alert, Button, Card, IconButton, LoadingState, TextInput, Textarea, useToast } from '../components/ui'
import { useForm, usePublishForm, useUpdateForm } from '../features/forms/queries'
import type { FieldConfig, UpdateFormInput } from '../types/form'

interface BuilderFormValues {
  title: string
  description: string
}

const FORM_ELEMENT_ID = 'form-builder'

export function FormBuilderPage() {
  const { formId } = useParams<{ formId: string }>()
  const { data: form, isLoading, isError } = useForm(formId ?? '')
  const updateForm = useUpdateForm(formId ?? '')
  const publishForm = usePublishForm(formId ?? '')
  const { showToast } = useToast()

  const [fields, setFields] = useState<FieldConfig[]>([])
  const initializedFor = useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<BuilderFormValues>()

  useEffect(() => {
    if (form && initializedFor.current !== form.id) {
      setFields(form.schema.fields)
      initializedFor.current = form.id
    }
  }, [form])

  if (isLoading) {
    return <LoadingState label="Loading form…" />
  }

  if (isError || !form) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Alert variant="error">Form not found.</Alert>
      </div>
    )
  }

  const isReadOnly = form.status !== 'DRAFT'
  const publicUrl = `${window.location.origin}/public/forms/${form.id}`

  const onSubmit = (values: BuilderFormValues) => {
    const input: UpdateFormInput = {
      title: values.title,
      description: values.description || undefined,
      schema: { fields },
    }
    updateForm.mutate(input, {
      onSuccess: () => showToast('success', 'Form saved'),
      onError: (error) => showToast('error', error.message),
    })
  }

  function handlePublish() {
    publishForm.mutate(undefined, {
      onSuccess: (result) => showToast('success', `Form published as version ${result.version}`),
      onError: (error) => showToast('error', error.message),
    })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl)
    showToast('success', 'Public link copied')
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-end gap-2">
        {isReadOnly && (
          <>
            <IconButton icon={Copy} label="Copy public link" onClick={handleCopyLink} />
            <a
              href={`/public/forms/${form.id}`}
              target="_blank"
              rel="noreferrer"
              aria-label="View public form"
              title="View public form"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </>
        )}

        {!isReadOnly && (
          <>
            <Button type="submit" form={FORM_ELEMENT_ID} size="sm" isLoading={updateForm.isPending}>
              Save
            </Button>
            <Button type="button" variant="secondary" size="sm" isLoading={publishForm.isPending} onClick={handlePublish}>
              Publish
            </Button>
          </>
        )}
      </div>

      <FormTabs formId={form.id} active="questions" />

      {isReadOnly && (
        <div className="mb-4">
          <Alert variant="warning">This form is published and read-only.</Alert>
        </div>
      )}

      <form id={FORM_ELEMENT_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card padding="none" className="overflow-hidden">
          <div className="h-2 bg-accent-600" />
          <div className="space-y-2 p-5">
            <TextInput
              aria-label="Form title"
              placeholder="Untitled form"
              defaultValue={form.title}
              disabled={isReadOnly}
              error={errors.title?.message}
              className="border-none px-0 text-2xl font-semibold"
              {...register('title', { required: 'Title is required' })}
            />

            <Textarea
              aria-label="Form description"
              placeholder="Form description"
              defaultValue={form.description ?? ''}
              disabled={isReadOnly}
              rows={1}
              className="border-none px-0 text-sm text-slate-600"
              {...register('description')}
            />
          </div>
        </Card>

        <FieldEditor fields={fields} onChange={setFields} disabled={isReadOnly} />
      </form>
    </div>
  )
}
