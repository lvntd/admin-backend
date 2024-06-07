import mongoose from 'mongoose'
import { Client } from './client.model.js'
import { User } from './user.model.js'

const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String },
    projectTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'POTENTIAL'],
      required: true,
    },
  },
  { timestamps: true },
)

projectSchema.post('save', async (doc) => {
  // 1. Find client and add this project
  const clientId = doc.client
  const client = await Client.findById(clientId)

  if (client) {
    client.projects.push(doc._id)
    client.save()
  }

  // 2. find users and add projectId to his/hers projects
  const userIds = doc.projectTeam.map(
    (memberId) => new mongoose.Types.ObjectId(memberId),
  )
  const users = await User.find({ _id: { $in: userIds } })

  users.forEach((user) => {
    user.projects.push(doc._id)
    user.save()
  })
})

projectSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery())

  this._originalProjectTeam = docToUpdate.projectTeam
  this._originalClient = docToUpdate.client

  next()
})

projectSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return

  const originalProjectTeam = this._originalProjectTeam || []
  const updatedProjectTeam = doc.projectTeam

  // Find added and removed users
  const addedUsers = updatedProjectTeam.filter(
    (id) => !originalProjectTeam.includes(id),
  )
  const removedUsers = originalProjectTeam.filter(
    (id) => !updatedProjectTeam.includes(id),
  )

  // Update added users
  if (addedUsers.length > 0) {
    await User.updateMany(
      { _id: { $in: addedUsers } },
      { $addToSet: { projects: doc._id } },
    )
  }

  // Update removed users
  if (removedUsers.length > 0) {
    await User.updateMany(
      { _id: { $in: removedUsers } },
      { $pull: { projects: doc._id } },
    )
  }

  const originalClient = this._originalClient
  const updatedClient = doc.client

  if (originalClient !== updatedClient) {
    await Promise.all([
      Client.findOneAndUpdate(
        { _id: originalClient },
        { $pull: { projects: doc._id } },
      ),
      Client.findOneAndUpdate(
        { _id: updatedClient },
        { $addToSet: { projects: doc._id } },
      ),
    ])
  }
})

projectSchema.pre('deleteOne', async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery())

  const clientId = docToDelete.client
  const userIds = docToDelete.projectTeam

  await Client.updateOne(
    { _id: clientId },
    { $pull: { projects: docToDelete._id } },
  )

  await User.updateMany(
    { _id: { $in: userIds } },
    { $pull: { projects: docToDelete._id } },
  )
  next()
})

export const Project = mongoose.model('Project', projectSchema)
