import mongoose from 'mongoose'
import Text from './Text'

const Schema = mongoose.Schema

const BlockRelationSchema = new Schema({
  block: { type: Schema.Types.ObjectId },
  relatedBlock: { type: Schema.Types.ObjectId },
  relationshipType: {
    type: String,
    enum: ['HEADING', 'INLINE'],
  },
  relatedBlockType: {
    type: String,
    enum: ['SOURCE', 'TOPIC'],
  },
  page: Schema.Types.ObjectId,
  blockIndex: {
    type: Number,
  },
  blockText: { type: Text.schema },
  account: { type: Schema.Types.ObjectId },
})

BlockRelationSchema.index({ block: 1, relatedBlock: 1 }, { unique: true })
BlockRelationSchema.index({ account: 1 })

const BlockRelation =
  mongoose.models.BlockRelation ||
  mongoose.model('blockRelation', BlockRelationSchema)

export default BlockRelation
