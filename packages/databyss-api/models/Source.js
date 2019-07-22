const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SourceSchema = new mongoose.Schema({
  //resource is a raw text
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  citations: {
    type: String,
  },
  author: {
    type: String,
  },
  authors: [
    {
      type: String,
    },
  ],
  abbreviation: {
    type: String,
  },
  date: {
    type: String,
  },
  default: {
    type: Boolean,
    default: false,
  },
  city: {
    type: String,
  },
  publishingCompany: {
    type: String,
  },
  sourceType: {
    type: String,
  },
  url: {
    type: String,
  },
  files: [
    {
      type: String,
    },
  ],
  entries: [
    {
      type: String,
    },
  ],
})

module.exports = Source = mongoose.model('source', SourceSchema)
