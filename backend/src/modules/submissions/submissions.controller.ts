import type { Request, Response } from 'express'
import * as submissionsService from './submissions.service.js'

export async function createSubmission(req: Request, res: Response) {
  const result = await submissionsService.createSubmission(req.params.formId as string, req.body)
  res.status(201).json({ submissionId: result.submissionId, message: 'Submission created successfully' })
}

export async function listSubmissions(req: Request, res: Response) {
  const result = await submissionsService.listSubmissions(req.params.formId as string)
  res.status(200).json(result)
}

export async function getSubmission(req: Request, res: Response) {
  const result = await submissionsService.getSubmission(req.params.submissionId as string)
  res.status(200).json(result)
}
