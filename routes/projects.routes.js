import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { createProject } from '../controllers/index.js'

const projectRoutes = Router()

projectRoutes.post('/', requireAuth, createProject)

export { projectRoutes }
