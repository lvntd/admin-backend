import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
    },
    lastName: {
      type: String,
      required: true,
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
      minLength: 8,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      required: true,
    },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    active: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
)

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

export const User = model('User', userSchema)
