import express from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import {
  createProject,
  deleteProject,
  editProject,
  getProject,
  getProjects,
} from '../controllers/index.js'
import { param } from 'express-validator'

const projectRoutes = express.Router()

projectRoutes.post('/', requireAuth, createProject)

// TODO. validate body of the request
projectRoutes.post('/all', requireAuth, getProjects)

projectRoutes.get(
  '/:projectId',
  requireAuth,
  param('projectId', 'projectId is required variable in path').notEmpty(),
  getProject,
)
projectRoutes.delete(
  '/:projectId',
  requireAuth,
  param('projectId', 'projectId is required variable in path').notEmpty(),
  deleteProject,
)
projectRoutes.put(
  '/:projectId',
  requireAuth,
  param('projectId', 'projectId is required variable in path').notEmpty(),
  editProject,
)

export { projectRoutes }
