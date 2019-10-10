const mongoose = require('mongoose')

const Schema = mongoose.Schema

const LocationSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  text: {
    type: String,
  },
  ranges: { type: Array },
})

const Location =
  mongoose.models.Location || mongoose.model('location', LocationSchema)

module.exports = Location
