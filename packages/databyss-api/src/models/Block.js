import mongoose from 'mongoose'
import Text from './Text'

const Schema = mongoose.Schema

const BlockSchema = new Schema(
  {
    type: {
      type: String,
      default: 'ENTRY',
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
  },
  { versionKey: false, timestamps: true }
)

BlockSchema.index({ 'text.textValue': 'text' })

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */

// Because `detail` is a Mixed type, it doesn't get flagged for update correctly and
// will not propagate to the server on a normal `save` call.
// If Block has `detail` values in it, use this method instead of `save`.
BlockSchema.method('saveWithDetail', async function() {
  validateBlock(this)
  const Block = mongoose.model('block', BlockSchema)
  await Block.replaceOne(
    { _id: this._id },
    {
      text: this.text,
      account: this.account,
      detail: this.detail,
      type: this.type,
    },
    { upsert: true }
  )
})

BlockSchema.pre('save', function(next) {
  validateBlock(this)
  next()
})

function validateBlock(block) {
  if (block.type.match(/^END_/)) {
    throw new Error(`Invalid block type: ${block.type} block`)
  }
}

export default mongoose.model('block', BlockSchema)
