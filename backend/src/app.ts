import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'
import { formsRouter } from './modules/forms/forms.routes.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api', formsRouter)

  app.use(errorHandler)

  return app
}
