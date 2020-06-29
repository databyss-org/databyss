import mongoose from 'mongoose'
import Text from './Text'
import Author from './Author'

const Schema = mongoose.Schema

const SourceSchema = new mongoose.Schema({
  block: {
    type: Schema.Types.ObjectId,
    ref: 'block',
  },
  resource: {
    type: String,
  },
  text: {
    type: Text.schema,
    required: true,
  },
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

const SourceDetail =
  mongoose.models.Source || mongoose.model('sourceDetail', SourceSchema)

export default SourceDetail
