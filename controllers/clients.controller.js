import { validationResult } from 'express-validator'
import { Client } from '../models/index.js'
import { serverResponse } from '../util/response.js'
import { StatusCodes } from 'http-status-codes'

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
      return serverResponse.sendError(res, {
        code: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'error_client_already_exists',
        details: null,
      })
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
      return serverResponse.sendSuccess(res, client)
    }
  } catch (error) {
    return next(error)
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
  } catch (error) {
    return next(error)
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
  } catch (error) {
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
    return serverResponse.sendSuccess(res, client)
  } catch (error) {
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

    return serverResponse.sendSuccess(res, null, 'alert_client_was_deleted')
  } catch (error) {
    return next(error)
  }
}
