const { validationResult } = require('express-validator')
const Client = require('../models/client.model')

exports.addClient = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { name, taxId, legalForm, active } = req.body
  const image = req.file

  Client.findOne({ taxId }).then((existingClient) => {
    if (existingClient) {
      return res
        .status(400)
        .json({ message: `Client already exists with this id ${taxId}` })
    }

    const newClient = new Client({
      name,
      taxId,
      legalForm,
      active,
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
  })
}

exports.editClient = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  const { name, taxId, legalForm, active } = req.body

  Client.findById(clientId)
    .then((client) => {
      if (client === null) {
        return res.json({ message: 'Client was not found' })
      }
      client.name = name
      client.taxId = taxId
      client.legalForm = legalForm
      client.active = active

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
  const perPage = Number(req.query.perPage) || 5
  const skip = (page - 1) * perPage
  let totalItems = 0

  // Search params
  const active = req.query.active

  console.log('ACTIVE', active)

  const query = {}
  if (active.length > 0) {
    query.active = active === 'active'
  }

  Client.find(query)
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts

      return Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .then((clients) => {
          res.status(200).json({
            message: 'Success',
            data: clients,
            total: totalItems,
            hasNextPage: perPage * page < totalItems,
            hasPreviousPage: page > 1,
            currentPage: page,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / perPage),
            perPage: perPage,
          })
        })
        .catch((err) => {
          const error = new Error(err)
          error.message = 'Could not get clients'
          return next(error)
        })
    })
}

exports.getClient = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  Client.findById(clientId)
    .then((client) => {
      res.status(200).json({ data: client })
    })
    .catch((err) => {
      const error = new Error(err)
      error.message = `Could not find client ${clientId}`
      return next(error)
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
      res.status(200).json({ message: 'Successfully deleted' })
    })
    .catch((err) => {
      const error = new Error(err)
      error.message = `Could not delete client ${clientId}`
      return next(error)
    })
}
