import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
      minLength: 2,
    },
    lastName: {
      type: String,
      required: false,
      minLength: 2,
    },
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
    role: {
      type: String,
      enum: ['admin', 'member'],
      required: true,
    },
    departnemt: { type: Schema.Types.ObjectId, ref: 'Department' },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    active: {
      type: Boolean,
      required: false,
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

export const User = mongoose.model('User', userSchema)
