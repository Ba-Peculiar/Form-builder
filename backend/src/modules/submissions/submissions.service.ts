import type { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../db/prisma.js'
import { NotFoundError, ValidationError } from '../../shared/errors.js'
import type { FormSchema } from '../../shared/types.js'
import { validateSubmission } from '../validation/validator.js'

export async function createSubmission(formId: string, data: unknown) {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form || form.status !== 'PUBLISHED' || form.currentVersion === null) {
    throw new NotFoundError('Form not found')
  }

  const version = await prisma.formVersion.findUnique({
    where: { formId_versionNumber: { formId, versionNumber: form.currentVersion } },
  })

  if (!version) {
    throw new NotFoundError('Form not found')
  }

  const schema = version.schema as unknown as FormSchema
  const result = validateSubmission(schema.fields, data)

  if (!result.valid) {
    throw new ValidationError('Validation failed', result.errors)
  }

  const submission = await prisma.submission.create({
    data: {
      formId,
      formVersionId: version.id,
      data: data as Prisma.InputJsonValue,
    },
  })

  return { submissionId: submission.id }
}

export async function listSubmissions(formId: string) {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) {
    throw new NotFoundError('Form not found')
  }

  const submissions = await prisma.submission.findMany({
    where: { formId },
    include: { formVersion: true },
    orderBy: { submittedAt: 'desc' },
  })

  return submissions.map((submission) => ({
    id: submission.id,
    submittedAt: submission.submittedAt,
    version: submission.formVersion.versionNumber,
  }))
}

export async function getSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { formVersion: true },
  })

  if (!submission) {
    throw new NotFoundError('Submission not found')
  }

  return {
    id: submission.id,
    formId: submission.formId,
    version: submission.formVersion.versionNumber,
    submittedAt: submission.submittedAt,
    data: submission.data,
  }
}
