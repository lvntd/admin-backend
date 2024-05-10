import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import multer from 'multer'
import { deleteFileFs } from '../util/file.js'
import { serverResponse } from '../util/response.js'
import { apiMessages } from '../config/messages.js'

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  },
})

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    req.fileValidationError = 'goes wrong on the mimetype'
    cb(null, false)
  }
}

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).single('file')

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  upload(req, res, function (error) {
    if (error) {
      // Handle the error from the upload process
      console.log(error)
      return res.status(422).json({ message: 'Error happened', error: error })
    }

    // Only attempt to send the file path if the file is successfully uploaded
    if (req.file) {
      res.status(200).json({ url: req.file.path })
    } else {
      // Handle cases where no file is uploaded due to fileFilter restrictions or other issues
      res
        .status(400)
        .json({ message: 'No file uploaded or file type is incorrect' })
    }
  })
}

export const deleteFile = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const filePath = req.query.filePath as string
  deleteFileFs(filePath, (error: unknown) => {
    if (error) {
      res.status(400).json({ message: 'Could not delete image', error: error })
      serverResponse.sendError(res, apiMessages.BAD_REQUEST)
    } else {
      serverResponse.sendError(res, apiMessages.SUCCESSFUL)
    }
  })
}
