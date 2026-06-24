import { useEffect, useRef, useState } from 'react'
import { useForm as useReactHookForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { FieldEditor } from '../components/FieldEditor'
import { Alert, Button, Card, LoadingState, TextInput, Textarea } from '../components/ui'
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

  const onSubmit = (values: BuilderFormValues) => {
    const input: UpdateFormInput = {
      title: values.title,
      description: values.description || undefined,
      schema: { fields },
    }
    updateForm.mutate(input)
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to forms
        </Link>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <Button type="submit" form={FORM_ELEMENT_ID} size="sm" isLoading={updateForm.isPending}>
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={publishForm.isPending}
              onClick={() => publishForm.mutate()}
            >
              Publish
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4 flex gap-6 border-b border-slate-200 text-sm font-medium">
        <span className="border-b-2 border-accent-600 px-1 pb-2 text-accent-700">Questions</span>
        <Link to={`/forms/${form.id}/submissions`} className="px-1 pb-2 text-slate-500 hover:text-slate-700">
          Responses
        </Link>
      </div>

      {isReadOnly && (
        <div className="mb-4">
          <Alert variant="warning" title="This form is published and read-only.">
            <Link to={`/public/forms/${form.id}`} className="underline">
              View public form
            </Link>{' '}
            ·{' '}
            <Link to={`/forms/${form.id}/submissions`} className="underline">
              View submissions
            </Link>
          </Alert>
        </div>
      )}

      {publishForm.isError && (
        <div className="mb-4">
          <Alert variant="error">{publishForm.error.message}</Alert>
        </div>
      )}
      {publishForm.isSuccess && (
        <div className="mb-4">
          <Alert variant="success" title={`Form published as version ${publishForm.data.version}.`}>
            <Link to={`/public/forms/${publishForm.data.formId}`} className="underline">
              View public form
            </Link>{' '}
            ·{' '}
            <Link to={`/forms/${publishForm.data.formId}/submissions`} className="underline">
              View submissions
            </Link>
          </Alert>
        </div>
      )}
      {updateForm.isError && (
        <div className="mb-4">
          <Alert variant="error">{updateForm.error.message}</Alert>
        </div>
      )}
      {updateForm.isSuccess && (
        <div className="mb-4">
          <Alert variant="success">Form saved.</Alert>
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
