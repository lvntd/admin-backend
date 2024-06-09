import { StatusCodes } from 'http-status-codes'
import { serverResponse } from '../util/response.js'

export const get404 = (req, res, next) => {
  serverResponse.sendError(res, {
    code: StatusCodes.NOT_FOUND,
    success: false,
    message: 'error_not_found',
    details: null,
  })
}
