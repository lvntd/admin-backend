import { validationResult } from 'express-validator'
import { Client } from '../models/index.js'
import io from '../socket.js'
import { serverResponse } from '../util/response.js'
import { apiMessages } from '../config/messages.js'

export const addClient = async (req, res, next) => {
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
      return serverResponse.sendError(res, apiMessages.ALREADY_EXIST)
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
      // @ts-ignore
      return serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, client)
    }
  } catch (err) {
    if (!res.headersSent) {
      return next(err)
    }
  }
}

export const editClient = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const { clientId } = req.params

  try {
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      {
        ...req.body,
      },
      { new: true },
    )

    return serverResponse.sendSuccess(res, updatedClient)
  } catch (err) {
    return next(err)
  }
}

export const getClients = async (req, res, next) => {
  const page = Number(req.query.page)
  const perPage = Number(req.query.perPage) || 5
  const skip = (page - 1) * perPage

  // Search params
  const { active, onlyWithProjects } = req.query

  const query = {}
  if (active) {
    query.active = active
  }

  if (onlyWithProjects === 'true') {
    query.projects = { $exists: true, $not: { $size: 0 } }
  }

  try {
    const totalItems = await Client.find(query).countDocuments()
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)

    return res.status(200).json({
      data: clients,
      total: totalItems,
      hasNextPage: perPage * page < totalItems,
      hasPreviousPage: page > 1,
      currentPage: page || 1,
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

export const getClient = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const clientId = req.params.clientId

  try {
    const client = await Client.findById(clientId)
    return res.status(200).json({ data: client })
  } catch (err) {
    const error = new Error(err)
    error.message = `Could not find client ${clientId}`
    return next(error)
  }
}

export const deleteClient = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
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
