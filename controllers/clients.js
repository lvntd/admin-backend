const { validationResult } = require('express-validator')
const Client = require('../models/client')

exports.addClient = (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const name = req.body.name
  const taxId = req.body.taxId
  const vatPayer = req.body.vatPayer
  const logoUrl = req.body.logoUrl

  const client = new Client({
    name,
    taxId,
    vatPayer,
    logoUrl,
  })

  client
    .save()
    .then((result) => {
      res.status(200).json({ message: 'Client created', data: result })
    })
    .catch((err) => {
      res.status(500).json({ message: 'Client was not created', error: err })
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
