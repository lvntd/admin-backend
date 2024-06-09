import { StatusCodes } from 'http-status-codes'

export const serverResponse = {
  sendSuccess: (res, data, message) => {
    return res.status(StatusCodes.OK).json({ data, message })
  },
  sendError: (res, error) => {
    const responseMessage = {
      code: error.code ? error.code : 500,
      success: false,
      message: error.message,
      detils: error.details || null,
    }
    return res.status(error.code ? error.code : 500).json(responseMessage)
  },
}
