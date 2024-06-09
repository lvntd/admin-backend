import express from 'express'
import { param } from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import {
  createNewUser,
  deleteClient,
  editUser,
  getUser,
  getUsers,
} from '../controllers/index.js'
import { validateData, userSchemaCreate } from '../validations/index.js'

const userRoutes = express.Router()

userRoutes.post('/', requireAuth, validateData(userSchemaCreate), createNewUser)
userRoutes.get('/', requireAuth, getUsers)
userRoutes.get(
  '/:userId',
  requireAuth,
  param('userId', 'userId is required variable in path').notEmpty(),
  getUser,
)

userRoutes.put(
  '/:userId',
  requireAuth,
  param('userId', ':userId is required variable in path').notEmpty(),
  editUser,
)

userRoutes.delete(
  '/:userId',
  requireAuth,
  param('userId', 'userId is required variable in path').notEmpty(),
  deleteClient,
)

export { userRoutes }
