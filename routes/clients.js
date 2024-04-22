const { checkSchema, param } = require('express-validator')
const Client = require('../models/client')

const express = require('express')

const clientsController = require('../controllers/clients')

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
      errorMessage: 'Name must be between 9 and 11 symbols',
    },
    isAlphanumeric: {
      errorMessage: 'Tax ID must contain only letters and numbers',
    },
    trim: true, // Removes leading and trailing spaces
    escape: true, // Escapes HTML entities
    // CUSTOM ASYNC VALIDATION: Check if id already exists
    custom: {
      options: (value) => {
        return Client.findOne({ taxId: value }).then((existingClient) => {
          if (existingClient) {
            return Promise.reject('This id already exists')
          }
        })
      },
    },
  },
  vatPayer: {
    errorMessage: 'Va Payer must be boolean',
    isBoolean: true,
    toBoolean: true, // Sanitize and convert to Boolean
  },
}

router.post('/', checkSchema(clientSchema), clientsController.addClient)
router.get('/all', clientsController.getClients)

router.put(
  '/:clientId',
  param('clientId', ':clientId is required variable in path').notEmpty(),
  checkSchema(clientSchema),
  clientsController.editClient,
)

router.delete(
  '/:clientId',
  param('clientId', 'clientId is required variable in path').notEmpty(),
  clientsController.deleteClient,
)

module.exports = router
