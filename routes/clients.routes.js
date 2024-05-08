import express from 'express'
import { checkSchema, param } from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import {
  addClient,
  deleteClient,
  editClient,
  getClient,
  getClients,
} from '../controllers/index.js'

const clientRoutes = express.Router()

const clientSchema = {
  name: {
    errorMessage: 'Name is required',
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Name must be between 3 and 50 symbols',
    },
    trim: true, // Sanitizing inputs
    escape: true,
  },
  taxId: {
    errorMessage: 'Tax ID is required',
    isLength: {
      options: { min: 9, max: 11 },
      errorMessage: 'Tax ID must be between 9 and 11 symbols',
    },
    isAlphanumeric: {
      errorMessage: 'Tax ID must contain only letters and numbers',
    },
    trim: true, // Removes leading and trailing spaces
    escape: true, // Escapes HTML entities
  },
  active: { isBoolean: { errorMessage: 'active field is required' } },
  legalForm: {
    errorMessage: 'Legal form is required',
  },
}

clientRoutes.post('/', requireAuth, checkSchema(clientSchema), addClient)
clientRoutes.get('/all', requireAuth, getClients)

clientRoutes.put(
  '/:clientId',
  requireAuth,
  param('clientId', ':clientId is required variable in path').notEmpty(),
  checkSchema(clientSchema),
  editClient,
)

clientRoutes.get(
  '/:clientId',
  requireAuth,
  param('clientId', 'clientId is required variable in path').notEmpty(),
  getClient,
)

clientRoutes.delete(
  '/:clientId',
  requireAuth,
  param('clientId', 'clientId is required variable in path').notEmpty(),
  deleteClient,
)

export { clientRoutes }
