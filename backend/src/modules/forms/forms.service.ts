import type { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../db/prisma.js'
import { ApiError, NotFoundError } from '../../shared/errors.js'
import type { FormSchema } from '../../shared/types.js'
import type { CreateFormInput, UpdateFormInput } from './forms.validation.js'

function toJson(schema: FormSchema): Prisma.InputJsonValue {
  return schema as unknown as Prisma.InputJsonValue
}

function fromJson(json: unknown): FormSchema {
  return json as unknown as FormSchema
}

export async function createForm(input: CreateFormInput) {
  const form = await prisma.form.create({
    data: {
      title: input.title,
      description: input.description,
      status: 'DRAFT',
    },
  })

  await prisma.formVersion.create({
    data: {
      formId: form.id,
      versionNumber: 1,
      schema: toJson({ title: form.title, fields: [] }),
    },
  })

  return form
}

export async function listForms() {
  return prisma.form.findMany({
    select: { id: true, title: true, status: true, currentVersion: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getForm(formId: string) {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) {
    throw new NotFoundError('Form not found')
  }

  const latestVersion = await prisma.formVersion.findFirst({
    where: { formId },
    orderBy: { versionNumber: 'desc' },
  })

  return {
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status,
    currentVersion: form.currentVersion,
    schema: latestVersion ? fromJson(latestVersion.schema) : { title: form.title, fields: [] },
  }
}

export async function updateForm(formId: string, input: UpdateFormInput) {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) {
    throw new NotFoundError('Form not found')
  }

  if (form.status !== 'DRAFT') {
    throw new ApiError(400, 'Only draft forms can be updated.')
  }

  const latestVersion = await prisma.formVersion.findFirst({
    where: { formId },
    orderBy: { versionNumber: 'desc' },
  })

  if (!latestVersion) {
    throw new ApiError(500, 'Draft form is missing its working version')
  }

  await prisma.$transaction([
    prisma.form.update({
      where: { id: formId },
      data: { title: input.title, description: input.description },
    }),
    prisma.formVersion.update({
      where: { id: latestVersion.id },
      data: {
        schema: toJson({
          title: input.title,
          fields: input.fields ?? fromJson(latestVersion.schema).fields,
        }),
      },
    }),
  ])
}

export async function publishForm(formId: string) {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) {
    throw new NotFoundError('Form not found')
  }

  if (form.status !== 'DRAFT') {
    throw new ApiError(400, 'Form is already published')
  }

  const draftVersion = await prisma.formVersion.findFirst({
    where: { formId },
    orderBy: { versionNumber: 'desc' },
  })

  if (!draftVersion) {
    throw new ApiError(500, 'Draft form is missing its working version')
  }

  await prisma.form.update({
    where: { id: formId },
    data: { status: 'PUBLISHED', currentVersion: draftVersion.versionNumber },
  })

  return {
    formId,
    version: draftVersion.versionNumber,
    status: 'PUBLISHED' as const,
    publicUrl: `/public/forms/${formId}`,
  }
}

export async function deleteForm(formId: string) {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) {
    throw new NotFoundError('Form not found')
  }

  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { formId } }),
    prisma.formVersion.deleteMany({ where: { formId } }),
    prisma.form.delete({ where: { id: formId } }),
  ])
}
