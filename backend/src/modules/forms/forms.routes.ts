import { Router } from 'express'
import * as formsController from './forms.controller.js'

export const formsRouter = Router()

formsRouter.post('/forms', formsController.createForm)
formsRouter.get('/forms', formsController.listForms)
formsRouter.get('/forms/:formId', formsController.getForm)
formsRouter.put('/forms/:formId', formsController.updateForm)
formsRouter.post('/forms/:formId/publish', formsController.publishForm)
formsRouter.delete('/forms/:formId', formsController.deleteForm)
