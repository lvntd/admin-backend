import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { serverResponse } from '../util/response.js'
import { apiMessages } from '../config/messages.js'
import { Types } from 'mongoose'

const maxAge = 3 * 24 * 60 * 60

const jwtSecret = process.env.JWT_SECRET || 'xyz890'

const createToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: maxAge,
  })
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { email, password } = req.body

  try {
    const user = await User.create({ email, password, role: 'admin' })
    const token = createToken(user._id)

    res.cookie('accessToken', token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    })

    // @ts-ignore
    serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, user)
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { email, password } = req.body

  try {
    // @ts-ignore
    const user = await User.login(email, password)
    const token = createToken(user._id)

    res.cookie('accessToken', token, { httpOnly: true, maxAge: maxAge * 1000 })

    res.status(200).json({ accessToken: token, userData: user })
  } catch (error) {
    next(error)
  }
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  try {
    const token = req.cookies.accessToken || req.headers.authorization
    const parsedToken = jwt.decode(token)

    if (parsedToken === null) {
      throw Error('User not found')
    }

    // @ts-ignore
    const user = await User.findById(parsedToken.id, { password: 0 })

    res.status(200).json({ accessToken: token, userData: user })
  } catch (error) {
    next(error)
  }
}
