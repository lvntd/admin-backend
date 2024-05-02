const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const errorController = require('./controllers/error.controller')
const clientRoutes = require('./routes/clients.routes')
const projectRoutes = require('./routes/projects.routes')
const authRoutes = require('./routes/auth.routes')
const filesRoutes = require('./routes/files.routes')
const { Server } = require('socket.io')

const cookieParser = require('cookie-parser')

const MONGODB_URI =
  'mongodb+srv://levanted:CIhduU3HxEC0f4r8@cluster0.hzpvtnv.mongodb.net/?retryWrites=true&w=majority'

const app = express()
new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
})

// Middlewares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

// Routes
app.use('/clients', clientRoutes)
app.use('/auth', authRoutes)
app.use('/files', filesRoutes)
app.use('/projects', projectRoutes)

// Error handlers
app.use(errorController.get404)
app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error.message })
})

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const server = app.listen(3002)

    const io = require('./socket').init(server, {
      cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
    })

    io.on('connection', (socket) => {
      console.log('Client connected')
    })
  })
  .catch((err) => {
    console.log(err)
  })
