import mongoose from 'mongoose'
import Text from './Text'

const Schema = mongoose.Schema

const BlockSchema = new Schema({
  type: {
    type: String,
  },
  text: {
    type: Text.schema,
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },
})

const Block = mongoose.models.Block || mongoose.model('block', BlockSchema)

export default Block
