import { validationResult } from 'express-validator'

import path from 'path'
import multer from 'multer'
import { deleteFileFs } from '../util/file.js'
import { Project } from '../models/project.model.js'
import { serverResponse } from '../util/response.js'
import { StatusCodes } from 'http-status-codes'

const publicImages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  },
})

const imagesFilter = (req, file, cb) => {
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

const uploadPublicImage = multer({
  storage: publicImages,
  fileFilter: imagesFilter,
}).single('file')

export const uploadImage = (req, res, next) => {
  uploadPublicImage(req, res, function (error) {
    if (error) {
      return serverResponse.sendError(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        success: false,
        message: 'error_image_upload_failed',
        details: error,
      })
    }

    // Only attempt to send the file path if the file is successfully uploaded
    if (req.file) {
      serverResponse.sendSuccess(res, { url: req.file.path })
    } else {
      // Handle cases where no file is uploaded due to fileFilter restrictions or other issues
      serverResponse.sendError(res, {
        code: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'error_image_upload_failed',
      })
    }
  })
}

export const uploadDocument = async (req, res, next) => {
  const { projectId } = req.params

  try {
    const project = await Project.findById(projectId)
    if (project === null) {
      serverResponse.sendError({
        code: StatusCodes.NOT_FOUND,
        success: false,
        message: 'error_project_not_found',
        details: { projectId },
      })
      return
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'documents')
      },
      filename: (req, file, cb) => {
        cb(null, `${projectId}_${file.originalname}`)
      },
    })

    const fileFilter = (req, file, cb) => {
      var filetypes = /doc|docx|pdf|xls|xlsx|txt/
      var mimetype = filetypes.test(file.mimetype)
      var extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      )

      if (mimetype && extname) {
        return cb(null, true)
      }
      cb(
        'Error: File upload only supports the following filetypes - ' +
          filetypes,
      )
    }

    const uploadPrivateDocument = multer({
      storage,
      fileFilter,
    }).single('file')

    uploadPrivateDocument(req, res, function (error) {
      if (error) {
        return serverResponse.sendError(res, {
          code: StatusCodes.UNPROCESSABLE_ENTITY,
          success: false,
          message: 'error_upload_failed',
          details: error,
        })
      }

      // Only attempt to send the file path if the file is successfully uploaded
      if (req.file) {
        serverResponse.sendSuccess(res, { url: req.file.path })
      } else {
        return serverResponse.sendError(res, {
          code: StatusCodes.BAD_REQUEST,
          success: false,
          message: 'error_upload_failed',
          details: error,
        })
      }
    })
  } catch (error) {
    return next(error)
  }
}

export const deleteFile = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const filePath = req.query.filePath
  deleteFileFs(filePath, (error) => {
    if (error) {
      serverResponse.sendError(res, {
        code: StatusCodes.UNPROCESSABLE_ENTITY,
        success: false,
        message: 'error_upload_failed',
        details: error,
      })
    } else {
      serverResponse.sendSuccess(res, 'alert_file_was_deleted')
    }
  })
}

export const getDocument = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const filePath = req.query.filePath

  try {
    const absolutePath = path.resolve(filePath)
    res.sendFile(absolutePath, (err) => {
      if (err) {
        next(err)
      }
    })
  } catch (error) {
    next(error)
  }
}
