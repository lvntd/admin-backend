const { validationResult } = require('express-validator')
const Client = require('../models/client.model')

exports.addClient = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { name, taxId, legalForm, active, imageUrl } = req.body

  try {
    const existingClient = await Client.findOne({ taxId })
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
      imageUrl,
    })
    const client = await newClient.save()

    if (client) {
      return res
        .status(201)
        .json({ message: 'Client created successfully', data: client })
    }
  } catch (err) {
    if (!res.headersSent) {
      const error = new Error(err)
      error.message = 'Could not create client'
      return next(error)
    }
  }
}

exports.editClient = async (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  const { name, taxId, legalForm, active } = req.body

  try {
    const client = await Client.findById(clientId)

    if (client === null) {
      return res.json({ message: 'Client was not found' })
    }
    client.name = name
    client.taxId = taxId
    client.legalForm = legalForm
    client.active = active

    const updatedClient = await client.save()

    return res
      .status(200)
      .json({ message: 'Client was updated', data: updatedClient })
  } catch (err) {
    const error = new Error(err)
    error.message = `Could not update client: ${clientId}`
    return next(error)
  }
}

exports.getClients = async (req, res, next) => {
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

  const query = {}
  if (active) {
    query.active = active
  }

  try {
    const totalItems = await Client.find(query).countDocuments()
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)

    return res.status(200).json({
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
  } catch (err) {
    const error = new Error(err)
    error.message = 'Could not get clients'
    return next(error)
  }
}

exports.getClient = async (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  try {
    const client = Client.findById(clientId)
    return res.status(200).json({ data: client })
  } catch (err) {
    const error = new Error(err)
    error.message = `Could not find client ${clientId}`
    return next(error)
  }
}

exports.deleteClient = async (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(400).json({ message: result })
  }

  const clientId = req.params.clientId

  try {
    await Client.deleteOne({ _id: clientId })
    res.status(200).json({ message: 'Successfully deleted' })
  } catch (err) {
    const error = new Error(err)
    error.message = `Could not delete client ${clientId}`
    return next(error)
  }
}
