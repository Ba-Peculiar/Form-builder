export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message)
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: { field: string; message: string }[],
  ) {
    super(400, message)
  }
}
