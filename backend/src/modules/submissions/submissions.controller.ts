import type { Request, Response } from 'express'
import * as submissionsService from './submissions.service.js'

export async function createSubmission(req: Request, res: Response) {
  const result = await submissionsService.createSubmission(req.params.formId as string, req.body)
  res.status(201).json({ submissionId: result.submissionId, message: 'Submission created successfully' })
}
