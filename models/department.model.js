const mongoose = require('mongoose')

const Schema = mongoose.Schema

const departmentSchema = new Schema(
  {
    name: { type: String, required: true },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Department', departmentSchema)
