import { ResponseMessage } from '../config/messages.js'

export const serverResponse = {
  sendSuccess: (res: any, message: ResponseMessage, data: any = null) => {
    const responseMessage: ResponseMessage & { data?: any } = {
      code: message.code ? message.code : 500,
      success: message.success,
      message: message.message,
    }
    if (data) {
      responseMessage.data = data
    }
    return res.status(message.code).json(responseMessage)
  },
  sendError: (res: any, error: ResponseMessage) => {
    const responseMessage = {
      code: error.code ? error.code : 500,
      success: false,
      message: error.message,
    }
    return res.status(error.code ? error.code : 500).json(responseMessage)
  },
}
