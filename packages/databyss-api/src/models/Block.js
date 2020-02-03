import mongoose from 'mongoose'

const Schema = mongoose.Schema

const BlockSchema = new Schema({
  type: {
    type: String,
  },
  entryId: {
    type: Schema.Types.ObjectId,
    ref: 'entry',
  },
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'topic',
  },
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'location',
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    ref: 'source',
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'author',
  },
})

const Block = mongoose.models.Block || mongoose.model('block', BlockSchema)

export default Block
