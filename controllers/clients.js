const { validationResult } = require('express-validator')
const Client = require('../models/client')

exports.addClient = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { name, taxId, vatPayer, logoUrl } = req.body

  Client.findOne({ taxId })
    .then((existingClient) => {
      if (existingClient) {
        res.status(400).json({ message: 'Tax ID already exists' })
        return null // This will stop the promise chain.
      }

      const newClient = new Client({
        name,
        taxId,
        vatPayer,
        logoUrl,
      })

      return newClient.save()
    })
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
        console.error(err)
        res.status(500).json({ message: 'Failed to create client', error: err })
      }
    })
}

exports.editClient = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId
  const name = req.body.name
  const taxId = req.body.taxId
  const vatPayer = req.body.vatPayer
  const logoUrl = req.body.logoUrl

  Client.findById(clientId)
    .then((client) => {
      if (client === null) {
        return res.json({ message: 'Client was not found' })
      }
      client.name = name
      client.taxId = taxId
      client.vatPayer = vatPayer
      client.logoUrl = logoUrl
      return client.save().then((result) => {
        res.status(200).json({ message: 'Client was updated' })
      })
    })
    .catch((err) =>
      res.status(500).json({ message: 'Error: Client was not updated' }),
    )
}

exports.getClients = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const searchParams = {}

  Object.entries(req.query).forEach(([key, value]) => {
    searchParams[key] = value
  })

  Client.find(searchParams)
    .then((clients) => {
      res.status(200).json({ message: 'Success', data: clients })
    })
    .catch((err) => res.status(500).json({ message: 'Error' }))
}

exports.deleteClient = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  console.log({ req })
  console.log({ clientId })

  Client.deleteOne({ _id: clientId })
    .then(() => {
      console.log('DESTROYED PRODUCT')
      res.status(200).json({ message: 'Successfully deleted' })
    })
    .catch((err) => res.status(500).json({ message: 'Could not delete' }))
}
