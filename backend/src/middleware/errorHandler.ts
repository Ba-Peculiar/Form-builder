import type { NextFunction, Request, Response } from 'express'
import { ApiError, ValidationError } from '../shared/errors'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ValidationError) {
    return res.status(err.status).json({ error: err.message, errors: err.errors })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message })
  }

  console.error(err)
  return res.status(500).json({ error: 'Internal server error' })
}
