import { validationResult } from 'express-validator'

import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { deleteFileFs } from '../util/file.js'
import { Project } from '../models/project.model.js'

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
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  uploadPublicImage(req, res, function (error) {
    if (error) {
      // Handle the error from the uploadPublicImage process
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

export const uploadDocument = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { projectId } = req.params

  try {
    const project = await Project.findById(projectId)
    if (project === null) {
      throw new Error('Project not found')
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
      if (file.mimetype === 'application/pdf') {
        cb(null, true)
      } else {
        req.fileValidationError = 'goes wrong on the mimetype'
        cb(null, false)
      }
    }

    const uploadPrivateDocument = multer({
      storage,
      fileFilter,
    }).single('file')

    uploadPrivateDocument(req, res, function (error) {
      if (error) {
        // Handle the error from the uploadPublicImage process
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
  } catch (err) {
    console.log(err)
    return next(err)
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
      res.status(400).json({ message: 'Could not delete image', error: error })
    } else {
      res.status(200).json({ message: 'Image deleted successfully' })
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
    res.status(500).json({ message: 'Error retrieving file', error })
  }
}
