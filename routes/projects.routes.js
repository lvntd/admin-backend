import express from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { createProject, getProjects } from '../controllers/index.js'

const projectRoutes = express.Router()

projectRoutes.post('/', requireAuth, createProject)
projectRoutes.get('/', requireAuth, getProjects)

export { projectRoutes }
