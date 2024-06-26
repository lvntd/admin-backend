import express from 'express'
import { login, signup, me } from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validateData } from '../validations/validator.js'
import { loginSchema } from '../validations/user.schema.js'

const authRoutes = express.Router()

authRoutes.post('/signup', signup)
authRoutes.post('/login', validateData(loginSchema), login)
authRoutes.get('/me', requireAuth, me)

export { authRoutes }
