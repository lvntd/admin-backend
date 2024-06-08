import { Schema, model } from 'mongoose'

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
    filePath: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

export const ProjectDoc = model('ProjectDoc', projectDocSchema)
