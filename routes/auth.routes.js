import express from 'express'
import { login, signup, me } from '../controllers/index.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const authRoutes = express.Router()

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
authRoutes.get('/me', requireAuth, me)

export { authRoutes }
