import mongoose from 'mongoose'
import Range from './Range'

const TextSchema = new mongoose.Schema(
  {
    textValue: { type: String, default: '' },
    ranges: {
      type: [Range],
      default: [],
    },
  },
  { _id: false }
)

const Text = mongoose.model('text', TextSchema)

export default Text
