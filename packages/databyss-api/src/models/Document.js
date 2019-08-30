const mongoose = require('mongoose')

const Schema = mongoose.Schema

const DocumentSchema = new Schema({
  rawText: {
    type: String,
    required: true,
  },
  parsedText: {
    type: String,
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  user: {
    type: String,
    required: true,
  },
})

const Document =
  mongoose.models.Document || mongoose.model('document', DocumentSchema)

module.exports = Document
