import mongoose from 'mongoose'
import Entry from './Entry'
import Block from './Block'
import Selection from './Selection'

const Schema = mongoose.Schema

const PageSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },
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
})

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
PageSchema.method('addEntry', async function(values = {}) {
  // add the entry record
  const entry = await Entry.create({
    account: this.account,
    ...values,
  })

  // add the block record
  const block = await Block.create({
    type: 'ENTRY',
    account: this.account,
    entryId: entry._id,
  })
  this.blocks.push({ _id: block._id })

  await this.save()
  return entry
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
  instance.addEntry()

  await instance.save()
  return instance
})

export default mongoose.model('page', PageSchema)
