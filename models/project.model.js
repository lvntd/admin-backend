const mongoose = require('mongoose')

const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      required: true,
    },
    projectTeam: {
      inCharge: { type: mongoose.Schema.Types.ObjectId },
      members: [{ type: mongoose.Schema.Types.ObjectId }],
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Project', projectSchema)
