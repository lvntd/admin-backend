const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const cors = require('cors')
const errorController = require('./controllers/error.controller')
const clientRoutes = require('./routes/clients.routes')
const authRoutes = require('./routes/auth.routes')
const multer = require('multer')

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
// parse application/json
app.use(bodyParser.json())
app.use(cookieParser())
app.use(multer().single('image'))
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/clients', clientRoutes)
app.use('/auth', authRoutes)

app.use(errorController.get404)

// Error handler
app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error.message })
})

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3002)
  })
  .catch((err) => {
    console.log(err)
  })
