import mongoose from 'mongoose'
import { validationResult } from 'express-validator'
import { serverResponse } from '../util/response.js'
import { apiMessages } from '../config/messages.js'
import { ProjectDoc } from '../models/project-doc.model.js'

export const createProjectDoc = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { projectId } = req.params

  try {
    const newProjectDoc = new ProjectDoc({ project: projectId, ...req.body })
    const projectDoc = await newProjectDoc.save()

    // @ts-ignore
    serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, projectDoc)
  } catch (err) {
    console.log(err)
    // Check to ensure no response has been sent
    if (!res.headersSent) {
      return next(err)
    }
  }
}

export const getProjectDocs = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const page = Number(req.query.page || 1)
  const perPage = Number(req.query.perPage || 200)
  const skip = (page - 1) * perPage

  const { projectId } = req.params

  const query = { project: projectId }

  try {
    const totalItems = await ProjectDoc.find(query).countDocuments()
    const items = await ProjectDoc.find(query)

      .sort({ date: -1 })
      .skip(skip)
      .limit(perPage)

    return res.status(200).json({
      message: 'Success',
      data: items,
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
    console.log(err)
    const error = new Error(err)
    error.message = 'Could not get project docs'
    return next(error)
  }
}

export const deleteProjectDoc = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const { documentId } = req.params

  try {
    await ProjectDoc.deleteOne({ _id: documentId })

    res.status(200).json({ message: 'Successfully deleted' })
  } catch (err) {
    const error = new Error(err)
    error.message = `Could not delete project document ${documentId}`
    return next(error)
  }
}
