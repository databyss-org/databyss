// const mongoose = require('mongoose')
// const Text = require('./Text')

// const AuthorSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     default: '',
//   },
//   lastName: {
//     type: String,
//     default: '',
//   },
// })

const mongoose = require('mongoose')

const Author = new mongoose.Schema({
  textValue: { type: String, default: 's' },
})

module.exports = Author

// const Author = mongoose.models.Author || mongoose.model('author', AuthorSchema)

// module.exports = Author
