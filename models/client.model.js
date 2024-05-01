const mongoose = require('mongoose')

const Schema = mongoose.Schema

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    taxId: {
      type: Number,
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

module.exports = mongoose.model('Client', clientSchema)
