import mongoose from 'mongoose'

const Schema = mongoose.Schema

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    taxId: {
      type: String,
      required: true,
      unique: true,
    },
    legalForm: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
)

export const Client = mongoose.model('Client', clientSchema)
