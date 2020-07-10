import mongoose from 'mongoose'
import Text from './Text'
import Author from './Author'

const SourceSchema = new mongoose.Schema({
  citations: {
    type: [Text.schema],
    default: [],
  },
  authors: {
    type: [Author.schema],
    default: [],
  },
  date: {
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
})

const Source = mongoose.models.Source || mongoose.model('source', SourceSchema)

export default Source
