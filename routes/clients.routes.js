const { checkSchema, param } = require('express-validator')
const Client = require('../models/client.model')
const express = require('express')
const clientsController = require('../controllers/clients.controller')
const { requireAuth } = require('../middleware/auth.middleware')

const router = express.Router()

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

router.post(
  '/',
  requireAuth,
  checkSchema(clientSchema),
  clientsController.addClient,
)
router.get('/all', requireAuth, clientsController.getClients)

router.put(
  '/:clientId',
  requireAuth,
  param('clientId', ':clientId is required variable in path').notEmpty(),
  checkSchema(clientSchema),
  clientsController.editClient,
)

router.get(
  '/:clientId',
  requireAuth,
  param('clientId', 'clientId is required variable in path').notEmpty(),
  clientsController.getClient,
)

router.delete(
  '/:clientId',
  requireAuth,
  param('clientId', 'clientId is required variable in path').notEmpty(),
  clientsController.deleteClient,
)

module.exports = router
