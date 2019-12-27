const mongoose = require('mongoose')

const Author = new mongoose.Schema({
  textValue: { type: String, default: '' },
})

module.exports = Author

// const Author = mongoose.models.Author || mongoose.model('author', AuthorSchema)

// module.exports = Author
