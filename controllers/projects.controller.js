import mongoose from 'mongoose'
import { validationResult } from 'express-validator'
import { Project, User } from '../models/index.js'
import { serverResponse } from '../util/response.js'

export const createProject = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  try {
    const newProject = new Project(req.body)
    const project = await newProject.save()

    // @ts-ignore
    serverResponse.sendSuccess(res, project)
  } catch (error) {
    return next(error)
  }
}

export const getProjects = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const page = Number(req.query.page)
  const perPage = Number(req.query.perPage) || 5
  const skip = (page - 1) * perPage

  // Search params
  const {
    active,
    status,
    direction = 'desc',
    sort = 'createdAt',
    searchValue,
    client,
    user,
  } = req.query

  const query = {}
  if (active) {
    query.active = active
  }

  if (status) {
    query.status = status
  }

  if (client) {
    query.client = client
  }

  if (user) {
    query.projectTeam = { $in: [user] }
  }

  if (searchValue && searchValue.length > 3) {
    query.name = { $regex: searchValue, $options: 'i' }
  }

  try {
    const totalItems = await Project.find(query).countDocuments()
    const items = await Project.find(query)
      .populate('projectTeam')
      .populate('client')
      .sort({ [sort]: direction === 'desc' ? -1 : 1 })
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
  } catch (error) {
    return next(error)
  }
}

export const getProject = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const projectId = req.params.projectId

  try {
    const project = await Project.findById(projectId)
      .populate('client')
      .populate('projectTeam')

    return serverResponse.sendSuccess(res, project)
  } catch (error) {
    return next(error)
  }
}

export const deleteProject = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const projectId = req.params.projectId

  try {
    await Project.deleteOne({ _id: projectId })

    return serverResponse.sendSuccess(res, null, 'alert_project_was_deleted')
  } catch (error) {
    return next(error)
  }
}

export const editProject = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const { projectId } = req.params

  try {
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        $set: { ...req.body },
      },
      { new: true },
    )

    return serverResponse.sendSuccess(res, updatedProject)
  } catch (error) {
    return next(error)
  }
}
