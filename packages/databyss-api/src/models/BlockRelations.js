import mongoose from 'mongoose'
import Text from './Text'

const Schema = mongoose.Schema

const BlockRelationsSchema = new Schema({
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
    pageHeader: {
      type: String,
    },
    blockIndex: {
      type: Number,
    },
  },
  blockText: { type: Text.schema },
  accountId: { type: Schema.Types.ObjectId },
})

BlockRelationsSchema.index({ blockId: 1, relatedBlockId: 1 }, { unique: true })

const BlockRelations =
  mongoose.models.BlockRelations ||
  mongoose.model('blockRelations', BlockRelationsSchema)

export default BlockRelations
