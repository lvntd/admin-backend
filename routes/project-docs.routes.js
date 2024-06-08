import express from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { param } from 'express-validator'
import {
  createProjectDoc,
  deleteProjectDoc,
  getProjectDocs,
} from '../controllers/project-docs.controller.js'

const projectDocRoutes = express.Router()

projectDocRoutes.post(
  '/:projectId',
  requireAuth,
  param('projectId', 'projectId is required variable in path').notEmpty(),
  createProjectDoc,
)

projectDocRoutes.get(
  '/:projectId',
  requireAuth,
  param('projectId', 'projectId is required variable in path').notEmpty(),
  getProjectDocs,
)

projectDocRoutes.delete(
  '/:documentId',
  requireAuth,
  param('documentId', 'documentId is required variable in path').notEmpty(),
  deleteProjectDoc,
)

export { projectDocRoutes }
