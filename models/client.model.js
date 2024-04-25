const mongoose = require('mongoose')

const Schema = mongoose.Schema

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  taxId: {
    type: Number,
    required: true,
  },
  legalForm: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  createdAt: { type: Date, required: true },
})

module.exports = mongoose.model('Client', clientSchema)
