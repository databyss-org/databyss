import mongoose from 'mongoose'
import Text from './Text'

const Schema = mongoose.Schema

const BlockSchema = new Schema({
  type: {
    type: String,
  },
  text: {
    type: Text.schema,
    default: () => new Text(),
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },
  detail: {
    type: Schema.Types.Mixed,
  },
})

const Block = mongoose.models.Block || mongoose.model('block', BlockSchema)

export default Block
