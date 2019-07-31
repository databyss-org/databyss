const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AuthorSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
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
      type: String,
    },
  ],
  default: {
    type: Boolean,
    default: false,
  },
  sources: [
    {
      type: String,
    },
  ],
})

const Author = mongoose.models.Author || mongoose.model('author', AuthorSchema)

module.exports = Author
