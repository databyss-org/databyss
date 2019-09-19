const mongoose = require('mongoose')

const Schema = mongoose.Schema

const SourceSchema = new mongoose.Schema({
  // resource is a raw text
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  resource: {
    type: String,
    //   required: true,
  },
  text: {
    type: String,
    required: true,
  },
  ranges: { type: Array },
  citations: {
    type: String,
  },
  author: {
    type: String,
  },
  authors: [
    {
      type: Schema.Types.ObjectId,
      ref: 'author',
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
      type: Schema.Types.ObjectId,
      ref: 'entry',
    },
  ],
})

const Source = mongoose.models.Source || mongoose.model('source', SourceSchema)

module.exports = Source
