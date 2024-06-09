import connectSession from 'connect-mongodb-session'
import express from 'express'
import mongoose from 'mongoose'
import session from 'express-session'
import cors from 'cors'
import path from 'path'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { get404 } from './controllers/index.js'
import socketIo from './socket.js'
import { fileURLToPath } from 'url'
import {
  authRoutes,
  clientRoutes,
  filesRoutes,
  projectRoutes,
} from './routes/index.js'
import { userRoutes } from './routes/users.routes.js'
import { serverResponse } from './util/response.js'
import { apiMessages } from './config/messages.js'
import 'dotenv/config'
import { projectDocRoutes } from './routes/project-docs.routes.js'
import { StatusCodes } from 'http-status-codes'

// tes

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename)

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.hzpvtnv.mongodb.net/?retryWrites=true&w=majority`

const MongoDBStore = connectSession(session)

const app = express()
new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
})

// Middlewares
app.use(cors())
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

// Routes
app.use('/users', userRoutes)
app.use('/clients', clientRoutes)
app.use('/auth', authRoutes)
app.use('/files', filesRoutes)
app.use('/projects', projectRoutes)
app.use('/project-docs', projectDocRoutes)

// Error handlers
app.use(get404)
app.use((error, _req, res, _next) => {
  serverResponse.sendError(res, {
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    success: false,
    message: 'error_internal_server_error',
    details: error,
  })
})

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const server = app.listen(process.env.PORT || 8080)

    const io = socketIo.init(server, {
      cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] },
    })

    io.on('connection', (socket) => {
      console.log('Client connected')
    })
  })
  .catch((err) => {
    console.log(err)
  })
