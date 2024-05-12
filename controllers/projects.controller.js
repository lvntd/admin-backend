import { validationResult } from 'express-validator'
import { Project, Client, User } from '../models/index.js'
import mongoose from 'mongoose'
import { serverResponse } from '../util/response.js'
import { apiMessages } from '../config/messages.js'

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
    const client = await Client.findById(req.body.client)

    const userIds = req.body.projectTeam.members.map(
      (memberId) => new mongoose.Types.ObjectId(memberId),
    )
    const users = await User.find({ _id: { $in: userIds } })

    users.forEach((user) => {
      user.projects.push(project._id)
      user.save()
    })

    if (client) {
      client.projects.push(project._id)
      client.save()
    }

    // @ts-ignore
    serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, project)
  } catch (err) {
    // Check to ensure no response has been sent
    if (!res.headersSent) {
      return next(err)
    }
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
  const active = req.query.active

  const query = {}
  if (active) {
    query.active = active
  }

  try {
    const totalItems = await Project.find(query).countDocuments()
    const items = await Project.find(query)
      .sort({ createdAt: -1 })
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
    error.message = 'Could not get users'
    return next(error)
  }
}
