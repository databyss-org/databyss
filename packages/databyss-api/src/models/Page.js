import mongoose from 'mongoose'
import Block from './Block'
import Selection from './Selection'
import { updateTimestamps } from '../lib/timestamps'

const Schema = mongoose.Schema

const PageSchema = new Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: 'account',
      required: true,
    },
    sharedWith: [
      {
        account: {
          type: Schema.Types.ObjectId,
        },
        role: {
          type: String,
          enum: ['VIEW'],
        },
      },
    ],
    name: {
      type: String,
      default: 'untitled',
    },
    blocks: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'block',
        },
        type: {
          type: String,
        },
      },
    ],
    selection: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'selection',
      },
    },
    archive: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  { versionKey: false }
)

PageSchema.index({ account: 1 })
PageSchema.index({ sharedWith: 1 })

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
PageSchema.pre('save', function(next) {
  updateTimestamps(this)
  next()
})

PageSchema.method('addBlock', async function(values = {}) {
  // add the block record
  const block = await Block.create({
    page: this._id,
    type: 'ENTRY',
    account: this.account,
    ...values,
  })

  this.blocks.push({ _id: block._id, type: 'ENTRY' })

  await this.save()
  return block
})

PageSchema.static('create', async (values = {}) => {
  const Page = mongoose.model('page', PageSchema)

  // add the selection
  let selection = new Selection({
    anchor: { offset: 0, index: 0 },
    focus: { offset: 0, index: 0 },
  })

  selection = new Selection(selection)
  await selection.save()

  const instance = new Page({ ...values, selection })

  // add an empty entry
  await instance.addBlock()

  await instance.save()
  return instance
})

export default mongoose.model('page', PageSchema)
