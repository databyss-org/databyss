const mongoose = require('mongoose')

const Schema = mongoose.Schema

const EntrySchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  ranges: { type: Array },
  author: [
    {
      type: Schema.Types.ObjectId,
      ref: 'author',
    },
  ],
  source: {
    type: Schema.Types.ObjectId,
    ref: 'source',
  },
  linkedContent: {
    type: String,
  },
  default: {
    type: Boolean,
    default: false,
  },
  pageFrom: {
    type: Number,
  },
  pageTo: {
    type: Number,
  },
  files: [
    {
      type: Array,
    },
  ],
  entry: {
    type: String,
  },
  text: {
    type: String,
  },
  index: {
    type: Number,
    default: 0,
  },
  document: {
    type: String,
    requied: true,
  },
})

const Entry = mongoose.models.Entry || mongoose.model('entry', EntrySchema)

module.exports = Entry
