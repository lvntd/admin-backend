import { Request, Response, NextFunction } from 'express'
import { apiMessages } from '../config/index.js'
import { serverResponse } from '../util/response.js'

export const get404 = (req: Request, res: Response, next: NextFunction) => {
  serverResponse.sendError(res, apiMessages.NOT_FOUND)
}
