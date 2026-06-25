import { prisma } from '../../db/prisma.js'
import { NotFoundError } from '../../shared/errors.js'
import type { FormSchema } from '../../shared/types.js'

export async function getPublishedForm(formId: string) {
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

  return {
    formId: form.id,
    version: version.versionNumber,
    title: form.title,
    description: form.description,
    schema: { fields: schema.fields, groups: schema.groups, ungroupedOrder: schema.ungroupedOrder },
  }
}
