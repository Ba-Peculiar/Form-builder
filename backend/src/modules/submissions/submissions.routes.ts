import { Router } from 'express'
import * as submissionsController from './submissions.controller.js'

export const submissionsRouter = Router()

submissionsRouter.post('/forms/:formId/submissions', submissionsController.createSubmission)
