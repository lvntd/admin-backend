const { validationResult, cookie } = require('express-validator')
const jwt = require('jsonwebtoken')

const User = require('../models/user.model')

const maxAge = 3 * 24 * 60 * 60

const createToken = (id) => {
  return jwt.sign({ id }, 'tediashvili secret', { expiresIn: maxAge })
}

exports.signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() })
  }

  const { email, password, confirmPassword } = req.body

  try {
    const user = await User.create({ email, password, role: 'admin' })
    const token = createToken(user._id)

    res.cookie('accessToken', token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: 'Lax',
      secure: false, // TODO. should be true in production
    })

    res.status(201).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
}

exports.login = async (req, res, next) => {
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
    console.log({ error })
    res.status(400).json({ message: error.message })
  }
}

exports.me = async (req, res, next) => {
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

    const user = await User.findById(parsedToken.id, { password: 0 })

    res.status(200).json({ accessToken: token, userData: user })
  } catch (error) {
    console.log({ error })
    res.status(404).json({ message: error.message })
  }
}
