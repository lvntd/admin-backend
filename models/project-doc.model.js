import { Schema, model } from 'mongoose'

const uploadedFileSchema = new Schema({
  path: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
})

const projectDocSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    uploadedFile: uploadedFileSchema,
  },
  { timestamps: true },
)

export const ProjectDoc = model('ProjectDoc', projectDocSchema)
