import { Router } from 'express'
import { deleteFile, uploadFile } from '../controllers/index.js'

const filesRoutes = Router()

filesRoutes.post('/', uploadFile)
filesRoutes.delete('/', deleteFile)

export { filesRoutes }
