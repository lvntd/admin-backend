import express from 'express'
import {
  deleteFile,
  getDocument,
  uploadDocument,
  uploadImage,
} from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const filesRoutes = express.Router()

filesRoutes.post('/images', requireAuth, uploadImage)
filesRoutes.post('/documents/:projectId', requireAuth, uploadDocument)
filesRoutes.get('/documents', requireAuth, getDocument)
filesRoutes.delete('/', requireAuth, deleteFile)

export { filesRoutes }
