const { validationResult } = require('express-validator')
const multer = require('multer')
const { deleteFile } = require('../util/file')

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  },
})

const fileFilter = (req, file, cb) => {
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

exports.uploadFile = (req, res, next) => {
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

exports.deleteFile = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const filePath = req.query.filePath
  deleteFile(filePath, (error) => {
    if (error) {
      res.status(400).json({ message: 'Could not delete image', error: error })
    } else {
      res.status(200).json({ message: 'Image deleted successfully' })
    }
  })
}
