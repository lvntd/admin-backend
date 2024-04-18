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
  vatPayer: {
    type: Boolean,
    required: true,
  },
  logoUrl: {
    type: String,
    required: false,
  },
})

module.exports = mongoose.model('Client', clientSchema)
