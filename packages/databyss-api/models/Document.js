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
  user: {
    type: String,
    required: true,
  },
})

module.exports = Document = mongoose.model('document', DocumentSchema)
