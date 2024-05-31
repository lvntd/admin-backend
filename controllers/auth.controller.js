import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { serverResponse } from '../util/response.js'
import { apiMessages } from '../config/messages.js'
import bcrypt from 'bcrypt'

const maxAge = 3 * 24 * 60 * 60

const jwtSecret = process.env.JWT_SECRET || 'xyz890'

const createToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: maxAge,
  })
}

export const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { firstName, lastName, email, password, active } = req.body

  try {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
      active,
    })
    const token = createToken(user._id)

    res.cookie('accessToken', token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: 'Lax',
      secure: false, // TODO. should be true in production
    })

    // @ts-ignore
    serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, user)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const login = async (req, res, next) => {
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

export const me = async (req, res, next) => {
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

    if (user) {
      res.status(200).json({ accessToken: token, userData: user })
    } else {
      serverResponse.sendError(res, apiMessages.NOT_FOUND)
    }
  } catch (error) {
    next(error)
  }
}
