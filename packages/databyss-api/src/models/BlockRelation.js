import mongoose from 'mongoose'
import Text from './Text'

const Schema = mongoose.Schema

const BlockRelationSchema = new Schema({
  blockId: { type: Schema.Types.ObjectId },
  relatedBlockId: { type: Schema.Types.ObjectId },
  relatedTo: {
    _id: Schema.Types.ObjectId,
    relationshipType: {
      type: String,
      enum: ['HEADING', 'INLINE'],
    },
    blockType: {
      type: String,
      enum: ['SOURCE', 'TOPIC'],
    },
    pageId: Schema.Types.ObjectId,
    blockIndex: {
      type: Number,
    },
  },
  blockText: { type: Text.schema },
  accountId: { type: Schema.Types.ObjectId },
})

BlockRelationSchema.index({ blockId: 1, relatedBlockId: 1 }, { unique: true })

const BlockRelation =
  mongoose.models.BlockRelation ||
  mongoose.model('blockRelation', BlockRelationSchema)

export default BlockRelation
