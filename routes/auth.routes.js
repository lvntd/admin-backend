import express from 'express'
import { login, signup, me } from '../controllers/index.js'

const authRoutes = express.Router()

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
authRoutes.get('/me', me)

export { authRoutes }
