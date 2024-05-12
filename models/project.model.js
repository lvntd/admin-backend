import mongoose from 'mongoose'

const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String },
    pricing: {
      currency: { type: String, enum: ['GEL', 'USD', 'EUR'], required: true },
      amount: { type: Number, required: true },
      paymentPeriod: {
        type: String,
        enum: ['ONE_OFF', 'MONTHLY', 'HOURLY'],
        required: true,
      },
      vatable: { type: Boolean, required: true },
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      required: true,
    },
    projectTeam: {
      inCharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
  },
  { timestamps: true },
)

export const Project = mongoose.model('Project', projectSchema)
