import type { Request, Response } from 'express'
import * as formsService from './forms.service.js'
import { validateCreateForm, validateUpdateForm } from './forms.validation.js'

export async function createForm(req: Request, res: Response) {
  const input = validateCreateForm(req.body)
  const form = await formsService.createForm(input)

  res.status(201).json({
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status,
    currentVersion: form.currentVersion,
    createdAt: form.createdAt,
  })
}

export async function listForms(_req: Request, res: Response) {
  const forms = await formsService.listForms()
  res.status(200).json(forms)
}

export async function getForm(req: Request, res: Response) {
  const form = await formsService.getForm(req.params.formId as string)
  res.status(200).json(form)
}

export async function updateForm(req: Request, res: Response) {
  const input = validateUpdateForm(req.body)
  await formsService.updateForm(req.params.formId as string, input)
  res.status(200).json({ message: 'Form updated successfully' })
}
