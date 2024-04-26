const { validationResult } = require('express-validator')
const Client = require('../models/client.model')

const ITEMS_PER_PAGE = 5

exports.addClient = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { name, taxId, legalForm, active } = req.body
  const image = req.file

  const newClient = new Client({
    name,
    taxId,
    legalForm,
    active,
    createdAt: new Date(),
  })

  newClient
    .save()
    .then((client) => {
      if (client) {
        // Ensure client is not null (stopped promise chain will result in client being null)
        res
          .status(201)
          .json({ message: 'Client created successfully', data: client })
      }
    })
    .catch((err) => {
      // Check to ensure no response has been sent
      if (!res.headersSent) {
        const error = new Error(err)
        error.message = 'Could not create client'
        return next(error)
      }
    })
}

exports.editClient = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  const { name, taxId, legalForm, image } = req.body

  Client.findById(clientId)
    .then((client) => {
      if (client === null) {
        return res.json({ message: 'Client was not found' })
      }
      client.name = name
      client.taxId = taxId
      client.legalForm = legalForm
      client.image = image
      return client.save().then((result) => {
        res.status(200).json({ message: 'Client was updated' })
      })
    })
    .catch((err) => {
      const error = new Error(err)
      error.message = `Could not update client: ${clientId}`
      return next(error)
    })
}

exports.getClients = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const page = Number(req.query.page)
  const skip = (page - 1) * ITEMS_PER_PAGE
  let totalItems = 0

  Client.find()
    .count()
    .then((numProducts) => {
      totalItems = numProducts

      return Client.find()
        .skip(skip)
        .limit(ITEMS_PER_PAGE)
        .then((clients) => {
          res.status(200).json({
            message: 'Success',
            data: clients,
            total: totalItems,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            currentPage: page,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            perPage: ITEMS_PER_PAGE,
          })
        })
        .catch((err) => {
          const error = new Error(err)
          error.message = 'Could not get clients'
          return next(error)
        })
    })
}

exports.deleteClient = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  Client.deleteOne({ _id: clientId })
    .then(() => {
      console.log('DESTROYED PRODUCT')
      res.status(200).json({ message: 'Successfully deleted' })
    })
    .catch((err) => {
      const error = new Error(err)
      error.message = `Could not delete client ${clientId}`
      return next(error)
    })
}
