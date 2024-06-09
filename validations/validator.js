import { ZodError } from 'zod'

import { StatusCodes } from 'http-status-codes'
import { serverResponse } from '../util/response.js'

export function validateData(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: `${issue.path.join('.')}: ${issue.message}`,
        }))
        serverResponse.sendError(res, {
          code: StatusCodes.BAD_REQUEST,
          success: false,
          message: 'error_validation_failed',
          details: errorMessages,
        })
      } else {
        serverResponse.sendError(res, {
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: 'error_internal_server_error',
          details: null,
        })
      }
    }
  }
}
