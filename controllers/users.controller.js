import { validationResult } from 'express-validator'
import { User } from '../models/index.js'
import io from '../socket.js'
import bcrypt from 'bcrypt'
import { serverResponse } from '../util/response.js'
import { StatusCodes } from 'http-status-codes'

export const createNewUser = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { email } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: `User already exists with this id ${email}` })
    }

    const defaultPassword = 'Test123123' // TODO. generate and send by email

    const salt = await bcrypt.genSalt()

    const password = await bcrypt.hash(defaultPassword, salt)
    const newUser = new User({ ...req.body, password })
    const user = await newUser.save()

    if (user) {
      return res
        .status(201)
        .json({ message: 'User created successfully', data: user })
    }
  } catch (err) {
    serverResponse.sendError({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'error_internal_server_error',
      details: null,
    })
  }
}

export const editUser = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const { userId } = req.params

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { ...req.body },
      },
      { new: true },
    )

    return res
      .status(200)
      .json({ message: 'User was updated', data: updatedUser })
  } catch (err) {
    const error = new Error(err)
    error.message = `Could not update user: ${userId}`
    return next(error)
  }
}

export const getUsers = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

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
    const totalItems = await User.find(query).countDocuments()
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)

    return res.status(200).json({
      message: 'Success',
      data: users,
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

export const getUser = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const userId = req.params.userId

  try {
    const user = await User.findById(userId, { password: 0 })
    if (user) {
      return res.status(200).json({ data: user })
    }
  } catch (err) {
    console.log(err)
    const error = new Error(err)
    error.message = `Could not find user: ${userId}`
    return next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() })
  }

  const userId = req.params.userId

  try {
    await User.deleteOne({ _id: userId })

    res.status(200).json({ message: 'Successfully deleted' })
  } catch (err) {
    const error = new Error(err)
    error.message = `Could not delete user ${userId}`
    return next(error)
  }
}
