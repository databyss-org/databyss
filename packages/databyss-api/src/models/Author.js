const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AuthorSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
    required: true,
  },
  entries: [
    {
      type: Schema.Types.ObjectId,
      ref: 'entry',
    },
  ],
  default: {
    type: Boolean,
    default: false,
  },
  sources: [
    {
      type: Schema.Types.ObjectId,
      ref: 'source',
    },
  ],
})

const Author = mongoose.models.Author || mongoose.model('author', AuthorSchema)

module.exports = Author
