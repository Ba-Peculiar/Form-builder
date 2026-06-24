import { Router } from 'express'
import * as publicController from './public.controller.js'

export const publicRouter = Router()

publicRouter.get('/public/forms/:formId', publicController.getPublishedForm)
