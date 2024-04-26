const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 4,
    },
  },
  { timestamps: true },
)

// @ts-ignore
userSchema.pre('save', async function (next) {
  console.log('User is about to be created and saved', this)

  const salt = await bcrypt.genSalt()

  this.password = await bcrypt.hash(this.password, salt)

  next()
})

userSchema.post('save', function (doc, next) {
  console.log('New user was created', doc)
  next()
})

userSchema.statics.login = async function (email, password) {
  // @ts-ignore
  const user = await this.findOne({ email })

  if (user) {
    // @ts-ignore
    const auth = await bcrypt.compare(password, user.password)
    console.log({ auth })
    if (auth) {
      return user
    }
    throw new Error('Incorrect password')
  }

  throw new Error('This email does not exist')
}

module.exports = mongoose.model('User', userSchema)
