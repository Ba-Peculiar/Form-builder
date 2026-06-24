import { Router } from 'express'
import * as submissionsController from './submissions.controller.js'

export const submissionsRouter = Router()

submissionsRouter.post('/forms/:formId/submissions', submissionsController.createSubmission)
submissionsRouter.get('/forms/:formId/submissions', submissionsController.listSubmissions)
submissionsRouter.get('/submissions/:submissionId', submissionsController.getSubmission)
