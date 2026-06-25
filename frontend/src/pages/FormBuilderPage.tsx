import { useEffect, useRef, useState } from 'react'
import { useForm as useReactHookForm } from 'react-hook-form'
import { Navigate, useParams } from 'react-router-dom'
import { FieldEditor } from '../components/FieldEditor'
import { Alert, Button, Card, LoadingState, TextInput, Textarea, useToast } from '../components/ui'
import { useForm, usePublishForm, useUpdateForm } from '../features/forms/queries'
import type { FieldConfig, FieldGroup, UpdateFormInput } from '../types/form'

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
  const [groups, setGroups] = useState<FieldGroup[]>([])
  const [ungroupedOrder, setUngroupedOrder] = useState<number | undefined>(undefined)
  const initializedFor = useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<BuilderFormValues>()

  useEffect(() => {
    if (form && initializedFor.current !== form.id) {
      setFields(form.schema.fields)
      setGroups(form.schema.groups ?? [])
      setUngroupedOrder(form.schema.ungroupedOrder)
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

  // Published forms are locked and rendered via the public view instead of
  // this editor - the builder only ever applies to drafts.
  if (form.status !== 'DRAFT') {
    return <Navigate to={`/forms/${form.id}/view`} replace />
  }

  const onSubmit = (values: BuilderFormValues) => {
    const input: UpdateFormInput = {
      title: values.title,
      description: values.description || undefined,
      schema: { fields, groups, ungroupedOrder },
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

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-end gap-2">
        <Button type="submit" form={FORM_ELEMENT_ID} size="sm" isLoading={updateForm.isPending}>
          Save
        </Button>
        <Button type="button" variant="secondary" size="sm" isLoading={publishForm.isPending} onClick={handlePublish}>
          Publish
        </Button>
      </div>

      <form id={FORM_ELEMENT_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card padding="none" className="overflow-hidden">
          <div className="h-2 bg-accent-600" />
          <div className="space-y-2 p-5">
            <TextInput
              aria-label="Form title"
              placeholder="Untitled form"
              defaultValue={form.title}
              error={errors.title?.message}
              className="border-none px-0 text-2xl font-semibold"
              {...register('title', { required: 'Title is required' })}
            />

            <Textarea
              aria-label="Form description"
              placeholder="Form description"
              defaultValue={form.description ?? ''}
              rows={1}
              className="border-none px-0 text-sm text-stone-600"
              {...register('description')}
            />
          </div>
        </Card>

        <FieldEditor
          fields={fields}
          groups={groups}
          ungroupedOrder={ungroupedOrder}
          onFieldsChange={setFields}
          onGroupsChange={setGroups}
          onUngroupedOrderChange={setUngroupedOrder}
        />
      </form>
    </div>
  )
}
