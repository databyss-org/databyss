const mongoose = require('mongoose')
const Text = require('./Text')

const AuthorSchema = new mongoose.Schema({
  firstName: {
    type: Text.schema,
  },
  lastName: {
    type: Text.schema,
  },
})

const Author = mongoose.models.Author || mongoose.model('author', AuthorSchema)

module.exports = Author
