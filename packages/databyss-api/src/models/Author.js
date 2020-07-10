import mongoose from 'mongoose'
import Text from './Text'

const AuthorSchema = new mongoose.Schema({
  firstName: {
    type: Text.schema,
  },
  lastName: {
    type: Text.schema,
  },
})

const Author = mongoose.models.Author || mongoose.model('author', AuthorSchema)

export default Author
