import express from 'express'
import { deleteFile, uploadFile } from '../controllers/index.js'

const filesRoutes = express.Router()

filesRoutes.post('/', uploadFile)
filesRoutes.delete('/', deleteFile)

export { filesRoutes }
