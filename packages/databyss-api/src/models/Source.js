const mongoose = require('mongoose')
const RichText = require('./RichText')

const Schema = mongoose.Schema

const SourceSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  resource: {
    type: String,
  },
  text: RichText,
  citations: [RichText],
  date: {
    type: String,
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
