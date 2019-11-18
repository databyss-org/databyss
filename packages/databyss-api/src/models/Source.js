const mongoose = require('mongoose')
const Range = require('./Range')
const RichTextSchema = require('./RichTextSchema')

const Schema = mongoose.Schema

const SourceSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  resource: {
    type: String,
  },
  name: {
    type: String,
  },
  ranges: [Range],
  citations: [RichTextSchema],

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
