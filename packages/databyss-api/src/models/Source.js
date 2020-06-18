import mongoose from 'mongoose'
import RichText from './RichText'
import Author from './Author'

const Schema = mongoose.Schema

const SourceSchema = new mongoose.Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  resource: {
    type: String,
  },
  text: {
    type: RichText.schema,
    required: true,
  },
  citations: {
    type: [RichText.schema],
    default: [],
  },
  authors: {
    type: [Author.schema],
    default: [],
  },
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
  pages: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'page',
      },
    },
  ],
})

const Source = mongoose.models.Source || mongoose.model('source', SourceSchema)

export default Source
