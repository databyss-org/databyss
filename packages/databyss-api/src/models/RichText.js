import mongoose from 'mongoose'
import Range from './Range'

const RichTextSchema = new mongoose.Schema(
  {
    textValue: { type: String, default: '' },
    ranges: {
      type: [Range],
      default: [],
    },
  },
  { _id: false }
)

const RichText = mongoose.model('richtext', RichTextSchema)

export default RichText
