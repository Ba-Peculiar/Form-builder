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
