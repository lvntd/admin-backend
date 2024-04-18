const { check, body, checkSchema, query, param } = require('express-validator')

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
  },
  taxId: {
    errorMessage: 'Name is required',
    isLength: {
      options: { min: 9, max: 11 },
      errorMessage: 'Name must be between 9 and 11 symbols',
    },
  },
  vatPayer: {
    errorMessage: 'vatPayer must be boolean',
    isBoolean: true,
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
  param('clientId', ':clientId is required variable in path').notEmpty(),
  clientsController.deleteClient,
)

module.exports = router
