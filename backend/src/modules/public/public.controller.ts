import type { Request, Response } from 'express'
import * as publicService from './public.service.js'

export async function getPublishedForm(req: Request, res: Response) {
  const form = await publicService.getPublishedForm(req.params.formId as string)
  res.status(200).json(form)
}
